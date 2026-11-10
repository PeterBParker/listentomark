# Listen To Mark

A mobile-friendly Next.js (TypeScript) app for browsing and playing sermons by Dr. Robert Mark Harris.

## Run locally

Requires Node 22.13+ (uses Node's built-in `node:sqlite`; no native modules to compile) and [`just`](https://github.com/casey/just).

```bash
just start
```

Then open http://localhost:3000. (`just start` installs dependencies if they're missing or changed, and builds the database if it's missing.)

To try it on a phone, open the "Network" address that `just start` prints (e.g. `http://192.168.1.20:3000`)
with the phone on the same Wi-Fi. `next.config.ts` allows this computer's network addresses (and `*.local` names)
so the dev server serves its JavaScript to the phone; without that, pages load but nothing interactive works.

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
- `data/sermons.db` – SQLite database with a single `sermons` table; one row per JSON item, columns named after the JSON keys, including `backup_audio_loc`.
- `id` is each sermon's permanent number, used in links (`/player?id=…`) and saved player positions. Leave it out
  when adding a sermon: `just import-db` assigns the next unused id and writes it back to the JSON. Ids are never
  renumbered or reused, so delete a sermon by removing its entry and rebuilding.
- Rebuild the DB after editing the JSON: `just import-db` (runs `scripts/import-sermons.mjs`).

## Audio fallback

The player tries `audio_url` (church CDN) first. If that fails it plays the Google Drive copy stored in
`backup_audio_loc`, through `/api/audio/[id]`: browsers can't play Drive links directly from another site
(Drive returns 403 with `Cross-Origin-Resource-Policy: same-site`), so the app's server fetches the file
and streams it, passing range requests through so seeking works.

`backup_audio_loc` comes from the public Drive folder. When sermons are added (matching on `file_name`):

```bash
npm run drive:links   # read the Drive folder, write backup_audio_loc into data/sermons.json
just import-db        # rebuild data/sermons.db
```
