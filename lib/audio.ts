import type { Sermon } from "./types";

/**
 * Google Drive fallback used when audio_url fails to load.
 *
 * TODO: sermons.json doesn't include Drive links yet. Once they exist, map
 * sermon -> Drive file ID here (e.g. from a lookup keyed by file_name) and return
 *   `https://drive.google.com/uc?export=download&id=${fileId}`
 */
const DRIVE_FILE_IDS: Record<string, string> = {
  // "2019-08-25_The-Plankton-Prophet.mp3": "<google-drive-file-id>",
};

export function getFallbackAudioUrl(sermon: Pick<Sermon, "file_name">): string | null {
  const id = DRIVE_FILE_IDS[sermon.file_name];
  return id ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}` : null;
}

/** Audio sources to try in order. */
export function audioSources(sermon: Sermon): string[] {
  return [sermon.audio_url, getFallbackAudioUrl(sermon)].filter((u): u is string => !!u);
}
