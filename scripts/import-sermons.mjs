// Converts data/sermons.json into data/sermons.db (table "sermons").
// Each JSON object becomes one row; column names are the JSON keys.
//
// "id" is each sermon's permanent number (used in links and saved player
// positions). Sermons without one get the next unused id, which is written back
// to the JSON so it never changes. Ids of deleted sermons are never reused: the
// highest id ever assigned is carried over from the previous database.
//
// Usage: node scripts/import-sermons.mjs [input.json] [output.db]
import { DatabaseSync } from "node:sqlite";
import { readFileSync, writeFileSync, rmSync, existsSync, renameSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const input = process.argv[2] ?? path.join(root, "data", "sermons.json");
const output = process.argv[3] ?? path.join(root, "data", "sermons.db");

const sermons = JSON.parse(readFileSync(input, "utf8"));
if (!Array.isArray(sermons) || sermons.length === 0) {
  throw new Error(`${input} must contain a non-empty JSON array`);
}

// --- Permanent ids -----------------------------------------------------------
const seen = new Set();
for (const s of sermons) {
  if (s.id == null) continue;
  if (!Number.isInteger(s.id) || s.id < 1) throw new Error(`Invalid id ${JSON.stringify(s.id)} for ${s.file_name}`);
  if (seen.has(s.id)) throw new Error(`Duplicate id ${s.id} (${s.file_name})`);
  seen.add(s.id);
}

// Highest id ever used: from the JSON and from the existing database (including
// ids of sermons deleted since, which AUTOINCREMENT records in sqlite_sequence).
let highest = Math.max(0, ...seen);
if (existsSync(output)) {
  const old = new DatabaseSync(output, { readOnly: true });
  const tables = old.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((r) => r.name);
  if (tables.includes("sqlite_sequence")) {
    const row = old.prepare("SELECT seq FROM sqlite_sequence WHERE name = 'sermons'").get();
    if (row) highest = Math.max(highest, Number(row.seq));
  }
  if (tables.includes("sermons")) {
    highest = Math.max(highest, Number(old.prepare("SELECT MAX(rowid) AS m FROM sermons").get().m ?? 0));
  }
  old.close();
}

const added = [];
for (const s of sermons) {
  if (s.id != null) continue;
  s.id = ++highest;
  added.push(s);
}
if (added.length) {
  // Write the new ids back, with "id" as the first key.
  const withIdFirst = sermons.map(({ id, ...rest }) => ({ id, ...rest }));
  writeFileSync(input, JSON.stringify(withIdFirst, null, 2) + "\n");
}

// --- Build the database --------------------------------------------------------
// Collect every key that appears in any object, preserving first-seen order.
const columns = [];
for (const s of sermons) for (const k of Object.keys(s)) if (!columns.includes(k)) columns.push(k);
const others = columns.filter((c) => c !== "id");
const quote = (c) => `"${c.replaceAll('"', '""')}"`;

// Build into a temp file and swap it in, so a failed import leaves the old DB intact.
const tmp = output + ".tmp";
if (existsSync(tmp)) rmSync(tmp);
const db = new DatabaseSync(tmp);
db.exec(
  `CREATE TABLE sermons (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    ${others.map((c) => `${quote(c)} TEXT`).join(",\n    ")}
  );
  CREATE INDEX sermons_date_idx ON sermons(date);`
);

const insert = db.prepare(
  `INSERT INTO sermons ("id", ${others.map(quote).join(", ")})
   VALUES (?, ${others.map(() => "?").join(", ")})`
);
db.exec("BEGIN");
for (const r of sermons) insert.run(r.id, ...others.map((c) => (r[c] == null ? null : String(r[c]))));
// Remember the highest id ever assigned, even if that sermon was removed.
db.prepare("UPDATE sqlite_sequence SET seq = ? WHERE name = 'sermons'").run(BigInt(highest));
db.exec("COMMIT");

const { n } = db.prepare("SELECT COUNT(*) AS n FROM sermons").get();
db.close();
renameSync(tmp, output);

console.log(`Imported ${n} sermons into ${path.relative(process.cwd(), output)} (columns: ${columns.join(", ")})`);
if (added.length) {
  console.log(`Assigned new ids (saved to ${path.relative(process.cwd(), input)}):`);
  for (const s of added) console.log(`  ${s.id}  ${s.file_name}`);
}
