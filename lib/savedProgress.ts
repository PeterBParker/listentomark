import type { Track } from "./types";

// The loaded sermon and its position, kept in localStorage so a refresh (or
// coming back later) resumes from the same spot. Storage can be unavailable
// (private mode, blocked site data), so every access is wrapped.
const KEY = "ltm:nowPlaying";

export interface SavedProgress {
  track: Track;
  time: number;
}

export function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedProgress;
    if (typeof saved?.track?.id !== "number" || !Array.isArray(saved.track.sources)) return null;
    return { track: saved.track, time: Number.isFinite(saved.time) && saved.time > 0 ? saved.time : 0 };
  } catch {
    return null;
  }
}

export function saveProgress(track: Track, time: number) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ track, time: Math.floor(time) }));
  } catch {}
}
