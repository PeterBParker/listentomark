import "server-only";
import { DatabaseSync } from "node:sqlite";
import Fuse from "fuse.js";
import path from "node:path";
import type { PlayContext, Quote, SearchParams, Sermon } from "./types";

const DB_PATH = process.env.SERMONS_DB ?? path.join(process.cwd(), "data", "sermons.db");

// Reuse one read-only connection across requests (and across dev hot reloads).
// Uses Node's built-in SQLite (no native add-on to compile).
const globalForDb = globalThis as unknown as { sermonsDb?: DatabaseSync };
function db(): DatabaseSync {
  globalForDb.sermonsDb ??= new DatabaseSync(DB_PATH, { readOnly: true });
  return globalForDb.sermonsDb;
}

// node:sqlite returns null-prototype rows; copy them into plain objects.
const plain = (row: unknown) => ({ ...(row as Sermon) });

const SELECT = "SELECT id, file_name, date, title, series, speaker, page_url, audio_url, backup_audio_loc FROM sermons";

/** All sermons, newest first. */
export function listSermons(): Sermon[] {
  return db().prepare(`${SELECT} ORDER BY date DESC, id DESC`).all().map(plain);
}

export function getSermon(id: number): Sermon | undefined {
  const row = db().prepare(`${SELECT} WHERE id = ?`).get(id);
  return row ? plain(row) : undefined;
}

/**
 * Fuzzy search over title and descriptive fields, optionally limited to a date range.
 * With a query, results are ordered by relevance; without one, newest first.
 */
export function searchSermons({ q, from, to }: SearchParams): Sermon[] {
  let rows = listSermons();
  if (from) rows = rows.filter((s) => s.date >= from);
  if (to) rows = rows.filter((s) => s.date <= to);

  const query = q?.trim();
  if (!query) return rows;

  const fuse = new Fuse(rows, {
    keys: [
      { name: "title", weight: 3 },
      // sermons.json has no description field yet; series and speaker stand in for it.
      { name: "series", weight: 1 },
      { name: "speaker", weight: 0.5 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
  });
  return fuse.search(query).map((r) => r.item);
}

/**
 * Previous/next sermon for the player.
 * - archive: chronological (previous = older, next = newer)
 * - search: the neighbouring items in the same search's result list
 */
export function getNeighbors(id: number, ctx: PlayContext): { prev?: Sermon; next?: Sermon } {
  if (ctx.kind === "search") {
    const results = searchSermons(ctx);
    const i = results.findIndex((s) => s.id === id);
    if (i === -1) return {};
    return { prev: results[i - 1], next: results[i + 1] };
  }
  const chrono = [...listSermons()].reverse(); // oldest first
  const i = chrono.findIndex((s) => s.id === id);
  if (i === -1) return {};
  return { prev: chrono[i - 1], next: chrono[i + 1] };
}

/** A random row from the quotes table (undefined if there are none). */
export function getRandomQuote(): Quote | undefined {
  try {
    const row = db().prepare("SELECT text, source, reason FROM quotes ORDER BY RANDOM() LIMIT 1").get();
    return row ? { ...(row as unknown as Quote) } : undefined;
  } catch {
    return undefined; // e.g. a database built before the quotes table existed
  }
}
