// Reads the public Google Drive folder of sermon audio and writes each file's
// direct download URL into data/sermons.json as "backup_audio_loc", matched on
// file_name. Run `npm run db:import` afterwards to rebuild the database.
//
// Usage: node scripts/fetch-drive-links.mjs [folderId]
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_FOLDER = "1MEsNHYGQg9R0GY8aOZiWFDd37as0jSM_";
const folderId = process.argv[2] ?? DEFAULT_FOLDER;
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const jsonPath = path.join(root, "data", "sermons.json");

// confirm=t skips Drive's "too large to scan for viruses" page for files over ~100 MB,
// so the URL always returns the audio itself (and supports range requests / seeking).
const downloadUrl = (id) =>
  `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;

const decode = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
   .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
   .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// The embedded folder view lists every file in a public folder as plain HTML.
const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}`);
if (!res.ok) throw new Error(`Drive folder request failed: HTTP ${res.status} (is the folder shared publicly?)`);
const html = await res.text();
const files = new Map();
for (const m of html.matchAll(/<div class="flip-entry" id="entry-([\w-]+)"[\s\S]*?flip-entry-title">([^<]*)/g)) {
  const name = decode(m[2]);
  if (files.has(name)) throw new Error(`Duplicate file name in Drive folder: ${name}`);
  files.set(name, m[1]);
}
if (files.size === 0) throw new Error("No files found in the Drive folder.");

const sermons = JSON.parse(readFileSync(jsonPath, "utf8"));
const missing = [];
for (const s of sermons) {
  const id = files.get(s.file_name);
  if (id) s.backup_audio_loc = downloadUrl(id);
  else missing.push(s.file_name);
}
const known = new Set(sermons.map((s) => s.file_name));
const extra = [...files.keys()].filter((n) => !known.has(n));

writeFileSync(jsonPath, JSON.stringify(sermons, null, 2) + "\n");
console.log(`Drive folder: ${files.size} files. Linked ${sermons.length - missing.length}/${sermons.length} sermons.`);
if (missing.length) console.log(`No Drive file for:\n  ${missing.join("\n  ")}`);
if (extra.length) console.log(`Drive files with no sermon:\n  ${extra.join("\n  ")}`);
