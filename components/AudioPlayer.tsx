"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Props {
  title: string;
  subtitle: string;
  sources: string[]; // tried in order: audio_url, then Google Drive fallback
  prevHref?: string;
  nextHref?: string;
}

const fmt = (t: number) => {
  if (!Number.isFinite(t)) return "--:--";
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? h + ":" : ""}${mm}:${String(s).padStart(2, "0")}`;
};

export default function AudioPlayer({ title, subtitle, sources, prevHref, nextHref }: Props) {
  const audio = useRef<HTMLAudioElement>(null);
  const router = useRouter();
  const [srcIndex, setSrcIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const [error, setError] = useState<string | null>(null);

  const src = sources[srcIndex];

  // Try to start playback whenever the source changes (browsers may block autoplay).
  useEffect(() => {
    const el = audio.current;
    if (!el || !src) return;
    el.load();
    el.play().catch(() => setPlaying(false));
  }, [src]);

  const onError = () => {
    if (srcIndex + 1 < sources.length) setSrcIndex(srcIndex + 1); // fall back to Google Drive
    else setError("This sermon's audio couldn't be loaded.");
  };

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  if (!src) return <p className="empty">No audio is available for this sermon.</p>;

  return (
    <div className="player">
      <div className="artwork" aria-hidden>
        <span>LTM</span>
      </div>
      <div className="now-playing">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => nextHref && router.push(nextHref)}
        onError={onError}
      />

      <div className="progress">
        <input
          type="range"
          min={0}
          max={Number.isFinite(duration) ? duration : 0}
          step={1}
          value={time}
          onChange={(e) => {
            if (audio.current) audio.current.currentTime = Number(e.target.value);
          }}
          aria-label="Seek"
        />
        <div className="times">
          <span>{fmt(time)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="controls">
        <NavButton href={prevHref} label="Previous">
          <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" fill="currentColor" />
        </NavButton>
        <button className="big-play" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden>
            {playing ? (
              <path d="M6 5h4v14H6zm8 0h4v14h-4z" fill="currentColor" />
            ) : (
              <path d="M8 5v14l11-7z" fill="currentColor" />
            )}
          </svg>
        </button>
        <NavButton href={nextHref} label="Next">
          <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" fill="currentColor" />
        </NavButton>
      </div>

      {srcIndex > 0 && !error && <p className="note">Playing from backup source.</p>}
      {error && <p className="note error">{error}</p>}
    </div>
  );
}

function NavButton({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  const icon = (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      {children}
    </svg>
  );
  return href ? (
    <Link href={href} className="skip" aria-label={label} replace>
      {icon}
    </Link>
  ) : (
    <span className="skip disabled" aria-label={label} aria-disabled>
      {icon}
    </span>
  );
}
