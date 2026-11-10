# Listen To Mark

A mobile-friendly Next.js (TypeScript) app for browsing and playing sermons by Dr. Robert Mark Harris.

## Run locally

Requires Node 22.13+ (uses Node's built-in `node:sqlite`; no native modules to compile) and [`just`](https://github.com/casey/just).

```bash
just start
```

Then open http://localhost:3000. (`just start` installs dependencies if they're missing or changed, and builds the database if it's missing.)

## Views

- **Archive** (`/`) – every sermon, newest first. Tap a row to expand its metadata; tap ▶ to play.
- **Search** (`/search`) – fuzzy search over title/series plus a From/To date filter. The Search tab returns to
  your last search (remembered for the browser tab, including across refreshes).
- **Player** (`/player?id=…`) – play/pause, seek bar, previous/next.
  - Started from the Archive → previous/next are the chronologically older/newer sermon.
  - Started from Search → previous/next walk the same search results (`src=search&q=…&from=…&to=…`).

Playback lives in the root layout (`components/PlayerProvider.tsx`), so audio keeps playing and keeps its
position while you move between Archive, Search and Player. A sermon only starts on its own when you press ▶
in a list; opening the Player tab (or using back/forward) never starts or restarts audio. When a sermon ends,
the next one in the same archive/search order plays, even if you're on another page.

The loaded sermon and its position are saved in `localStorage` (`lib/savedProgress.ts`), so after a refresh
the player comes back on the same sermon at the same spot, paused.

All pages are server-rendered; the player, play buttons and tab bar are the only client components.

## Data

- `data/sermons.json` – source data.
- `data/sermons.db` – SQLite database with a single `sermons` table; one row per JSON item, columns named after the JSON keys (rows are addressed by SQLite's `rowid`).
- Rebuild the DB after editing the JSON: `just import-db` (runs `scripts/import-sermons.mjs`).

## Audio fallback

The player tries `audio_url` first. If it fails to load, it falls back to a Google Drive link from `lib/audio.ts`.
The JSON doesn't contain Drive links yet, so add `file_name → Drive file ID` entries to `DRIVE_FILE_IDS` there.
