"use client";
import Link from "next/link";
import { useEffect } from "react";
import type { Track } from "@/lib/types";
import { usePlayer } from "./PlayerProvider";

const fmt = (t: number) => {
  if (!Number.isFinite(t)) return "--:--";
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? h + ":" : ""}${mm}:${String(s).padStart(2, "0")}`;
};

/**
 * The Player screen. Playback itself lives in <PlayerProvider>, so this view only
 * reflects it: opening this page never starts or restarts audio on its own.
 *
 * `track` is the sermon in the URL. With no id in the URL (`fallback`), it shows
 * whatever is loaded, or the newest sermon if nothing is.
 */
export default function PlayerView({ track: urlTrack, fallback }: { track?: Track; fallback: Track }) {
  const p = usePlayer();
  const track = urlTrack ?? p.current ?? fallback;
  const isCurrent = p.current?.id === track.id;

  // Same sermon as the one loaded: pick up prev/next for this page's context.
  const { updateCurrent } = p;
  useEffect(() => {
    if (urlTrack) updateCurrent(urlTrack);
  }, [urlTrack, updateCurrent]);

  const shown = isCurrent && p.current ? p.current : track;
  const time = isCurrent ? p.time : 0;
  const duration = isCurrent ? p.duration : NaN;
  const playing = isCurrent && p.playing;

  // A sermon that isn't loaded yet is only shown; it starts when play is pressed.
  const onPlayPause = () => (isCurrent ? p.toggle() : p.play(track));

  return (
    <div className="player">
      <div className="now-playing">
        <h1>{shown.title}</h1>
        <p>{shown.subtitle}</p>
      </div>

      <div className="progress">
        <input
          type="range"
          min={0}
          max={Number.isFinite(duration) ? duration : 0}
          step={1}
          value={time}
          disabled={!isCurrent}
          onChange={(e) => p.seek(Number(e.target.value))}
          aria-label="Seek"
        />
        <div className="times">
          <span>{fmt(time)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="controls">
        <SkipButton dir="prev" href={shown.prevHref} isCurrent={isCurrent} />
        <JumpButton seconds={-15} disabled={!isCurrent} onJump={p.jump} />
        <button className="big-play" onClick={onPlayPause} aria-label={playing ? "Pause" : "Play"}>
          <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden>
            {playing ? (
              <path d="M6 5h4v14H6zm8 0h4v14h-4z" fill="currentColor" />
            ) : (
              <path d="M8 5v14l11-7z" fill="currentColor" />
            )}
          </svg>
        </button>
        <JumpButton seconds={15} disabled={!isCurrent} onJump={p.jump} />
        <SkipButton dir="next" href={shown.nextHref} isCurrent={isCurrent} />
      </div>

      {isCurrent && p.usingFallback && !p.error && <p className="note">Playing from backup source.</p>}
      {isCurrent && p.error && <p className="note error">{p.error}</p>}
    </div>
  );
}

function SkipButton({ dir, href, isCurrent }: { dir: "prev" | "next"; href?: string; isCurrent: boolean }) {
  const { skip } = usePlayer();
  const label = dir === "prev" ? "Previous" : "Next";
  const icon = (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
      {dir === "prev" ? (
        <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" fill="currentColor" />
      ) : (
        <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" fill="currentColor" />
      )}
    </svg>
  );
  if (!href) {
    return (
      <span className="skip disabled" aria-label={label} aria-disabled>
        {icon}
      </span>
    );
  }
  // Loaded track: skip keeps playing if it was playing. Otherwise just browse.
  return isCurrent ? (
    <button className="skip" aria-label={label} onClick={() => skip(dir)}>
      {icon}
    </button>
  ) : (
    <Link href={href} className="skip" aria-label={label} replace>
      {icon}
    </Link>
  );
}

/** Rewind / fast-forward by a fixed number of seconds: a circular arrow with the count inside. */
function JumpButton({ seconds, disabled, onJump }: { seconds: number; disabled: boolean; onJump: (s: number) => void }) {
  const back = seconds < 0;
  const n = Math.abs(seconds);
  const label = back ? `Rewind ${n} seconds` : `Fast forward ${n} seconds`;
  return (
    <button
      className={disabled ? "skip disabled" : "skip"}
      onClick={() => onJump(seconds)}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" width="38" height="38" aria-hidden>
        {/* Counter-clockwise arrow for rewind; mirrored for fast forward. */}
        <path
          d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
          fill="currentColor"
          transform={back ? undefined : "matrix(-1 0 0 1 24 0)"}
        />
        <text x="12" y="16.2" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor">
          {n}
        </text>
      </svg>
    </button>
  );
}
