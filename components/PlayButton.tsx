"use client";
import Link from "next/link";
import type { Track } from "@/lib/types";
import { usePlayer } from "./PlayerProvider";

/** ▶ in the Archive/Search lists: starts playback on click, then opens the Player. */
export default function PlayButton({ track }: { track: Track }) {
  const { play } = usePlayer();
  return (
    <Link href={track.href} className="play-btn" aria-label={`Play ${track.title}`} onClick={() => play(track)}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
        <path d="M8 5v14l11-7z" fill="currentColor" />
      </svg>
    </Link>
  );
}
