/** One row of the "sermons" table. Columns mirror the keys in data/sermons.json. */
export interface Sermon {
  id: number; // permanent id (from sermons.json)
  file_name: string;
  date: string; // YYYY-MM-DD
  title: string;
  series: string | null;
  speaker: string | null;
  page_url: string | null;
  audio_url: string | null;
  backup_audio_loc: string | null; // Google Drive direct download URL
}

export interface SearchParams {
  q?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

/** Where the user pressed play, which decides what "next"/"previous" mean. */
export type PlayContext = { kind: "archive" } | ({ kind: "search" } & SearchParams);

/** Everything the client-side player needs to play one sermon. */
export interface Track {
  id: number;
  title: string;
  subtitle: string;
  sources: string[]; // tried in order: audio_url, then Google Drive fallback
  href: string; // this track's /player URL (includes the play context)
  prevHref?: string;
  nextHref?: string;
}

/** One row of the "quotes" table. */
export interface Quote {
  text: string;
  source: string | null;
  reason: string | null;
}
