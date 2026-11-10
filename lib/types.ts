/** One row of the "sermons" table. Columns mirror the keys in data/sermons.json. */
export interface Sermon {
  id: number; // SQLite rowid
  file_name: string;
  date: string; // YYYY-MM-DD
  title: string;
  series: string | null;
  speaker: string | null;
  page_url: string | null;
  audio_url: string | null;
}

export interface SearchParams {
  q?: string;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}

/** Where the user pressed play, which decides what "next"/"previous" mean. */
export type PlayContext = { kind: "archive" } | ({ kind: "search" } & SearchParams);
