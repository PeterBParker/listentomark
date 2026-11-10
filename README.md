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
- **Search** (`/search`) – fuzzy search over title/series plus a From/To date filter.
- **Player** (`/player?id=…`) – play/pause, seek bar, previous/next.
  - Started from the Archive → previous/next are the chronologically older/newer sermon.
  - Started from Search → previous/next walk the same search results (`src=search&q=…&from=…&to=…`).

All pages are server-rendered; only the player and tab bar ship client JS.

## Data

- `data/sermons.json` – source data.
- `data/sermons.db` – SQLite database with a single `sermons` table; one row per JSON item, columns named after the JSON keys (rows are addressed by SQLite's `rowid`).
- Rebuild the DB after editing the JSON: `just import-db` (runs `scripts/import-sermons.mjs`).

## Audio fallback

The player tries `audio_url` first. If it fails to load, it falls back to a Google Drive link from `lib/audio.ts`.
The JSON doesn't contain Drive links yet, so add `file_name → Drive file ID` entries to `DRIVE_FILE_IDS` there.
