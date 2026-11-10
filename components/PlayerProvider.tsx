"use client";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { loadProgress, saveProgress } from "@/lib/savedProgress";
import type { Track } from "@/lib/types";

interface PlayerState {
  current: Track | null;
  playing: boolean;
  time: number;
  duration: number;
  error: string | null;
  usingFallback: boolean;
  /** Load a track and optionally start it. Resumes instead if it's already loaded. */
  play: (track: Track, opts?: { autoplay?: boolean }) => void;
  /** Update the current track's info (e.g. prev/next) without touching playback. */
  updateCurrent: (track: Track) => void;
  toggle: () => void;
  seek: (t: number) => void;
  skip: (dir: "prev" | "next") => void;
}

const PlayerContext = createContext<PlayerState | null>(null);

export function usePlayer(): PlayerState {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return ctx;
}

/**
 * Owns the single <audio> element. It lives in the root layout, so playback and
 * progress survive navigating between Archive, Search and Player.
 */
export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const [error, setError] = useState<string | null>(null);
  const [srcIndex, setSrcIndex] = useState(0);
  const wantPlay = useRef(false); // should playback continue after a source switch?
  const resumeAt = useRef(0); // position to seek to once a restored track's metadata loads
  const lastSaved = useRef(0);

  // Restore the sermon and position from before a refresh. It comes back paused.
  useEffect(() => {
    const saved = loadProgress();
    const el = audio.current;
    if (!saved || !el || !saved.track.sources[0]) return;
    setCurrent(saved.track);
    setTime(saved.time);
    resumeAt.current = saved.time;
    el.src = saved.track.sources[0];
  }, []);

  // Save the position regularly while playing, and when the page is hidden/closed.
  const persist = useCallback(() => {
    const el = audio.current;
    if (current && el && !resumeAt.current) saveProgress(current, el.currentTime);
  }, [current]);
  useEffect(() => {
    window.addEventListener("pagehide", persist);
    return () => window.removeEventListener("pagehide", persist);
  }, [persist]);

  const load = useCallback((track: Track, autoplay: boolean) => {
    const el = audio.current;
    if (!el) return;
    setCurrent(track);
    saveProgress(track, 0);
    resumeAt.current = 0;
    lastSaved.current = 0;
    setSrcIndex(0);
    setError(null);
    setTime(0);
    setDuration(NaN);
    wantPlay.current = autoplay;
    if (!track.sources[0]) {
      el.removeAttribute("src");
      setError("No audio is available for this sermon.");
      return;
    }
    el.src = track.sources[0];
    // play() must run synchronously inside the click handler for mobile browsers.
    if (autoplay) el.play().catch(() => {});
  }, []);

  const play = useCallback<PlayerState["play"]>(
    (track, { autoplay = true } = {}) => {
      const el = audio.current;
      if (current?.id === track.id && el) {
        if (autoplay) el.play().catch(() => {});
        return;
      }
      load(track, autoplay);
    },
    [current, load]
  );

  const updateCurrent = useCallback((track: Track) => {
    setCurrent((c) =>
      c && c.id === track.id && (c.href !== track.href || c.prevHref !== track.prevHref || c.nextHref !== track.nextHref)
        ? track
        : c
    );
  }, []);

  const toggle = useCallback(() => {
    const el = audio.current;
    if (!el || !current) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }, [current]);

  const seek = useCallback((t: number) => {
    if (audio.current) audio.current.currentTime = t;
  }, []);

  const skip = useCallback(
    async (dir: "prev" | "next", autoplay?: boolean) => {
      const href = dir === "prev" ? current?.prevHref : current?.nextHref;
      if (!href) return;
      const keepPlaying = autoplay ?? !audio.current?.paused;
      const res = await fetch(`/api/track?${href.split("?")[1] ?? ""}`);
      if (!res.ok) return;
      const track: Track = await res.json();
      load(track, keepPlaying);
      if (pathname === "/player") router.replace(track.href, { scroll: false });
    },
    [current, load, pathname, router]
  );

  const onError = () => {
    if (!current) return;
    const next = srcIndex + 1;
    if (next < current.sources.length && audio.current) {
      setSrcIndex(next); // fall back to Google Drive
      audio.current.src = current.sources[next];
      if (wantPlay.current) audio.current.play().catch(() => {});
    } else {
      setError("This sermon's audio couldn't be loaded.");
    }
  };

  const value: PlayerState = {
    current,
    playing,
    time,
    duration,
    error,
    usingFallback: srcIndex > 0,
    play,
    updateCurrent,
    toggle,
    seek,
    skip: (dir) => void skip(dir),
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audio}
        preload="metadata"
        onPlay={() => {
          wantPlay.current = true;
          setPlaying(true);
        }}
        onPause={() => {
          persist();
          wantPlay.current = false;
          setPlaying(false);
        }}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (resumeAt.current && t < 1) return; // ignore the 0 reported before a restore seek
          if (resumeAt.current) resumeAt.current = 0; // playing on from somewhere else
          setTime(t);
          if (Math.abs(t - lastSaved.current) >= 5) {
            lastSaved.current = t;
            persist();
          }
        }}
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          setDuration(el.duration);
          if (resumeAt.current) el.currentTime = Math.min(resumeAt.current, el.duration || resumeAt.current);
        }}
        onSeeked={(e) => {
          // A restore seek counts once it lands; until then keep the saved position.
          if (resumeAt.current && Math.abs(e.currentTarget.currentTime - resumeAt.current) < 2) resumeAt.current = 0;
          persist();
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          // Finished the last one in the list: next time, start it from the beginning.
          if (current && !current.nextHref) saveProgress(current, 0);
          void skip("next", true);
        }}
        onError={onError}
      />
    </PlayerContext.Provider>
  );
}
