import type { Sermon } from "./types";

/**
 * Audio sources to try in order: the church CDN (audio_url), then the Google
 * Drive copy (backup_audio_loc, filled in by `npm run drive:links`).
 *
 * The Drive copy is played through /api/audio/[id], because browsers block
 * Drive download links on other sites (see app/api/audio/[id]/route.ts).
 */
export function audioSources(sermon: Pick<Sermon, "id" | "audio_url" | "backup_audio_loc">): string[] {
  const sources: string[] = [];
  if (sermon.audio_url) sources.push(sermon.audio_url);
  if (sermon.backup_audio_loc) sources.push(`/api/audio/${sermon.id}`);
  return sources;
}
