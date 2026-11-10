// Converts data/sermons.json into data/sermons.db (table "sermons").
// Each JSON object becomes one row; column names are the JSON keys.
// Rows are addressed by SQLite's built-in rowid (no extra column is added).
// Usage: node scripts/import-sermons.mjs [input.json] [output.db]
import Database from "better-sqlite3";
import { readFileSync, rmSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const input = process.argv[2] ?? path.join(root, "data", "sermons.json");
const output = process.argv[3] ?? path.join(root, "data", "sermons.db");

const sermons = JSON.parse(readFileSync(input, "utf8"));
if (!Array.isArray(sermons) || sermons.length === 0) {
  throw new Error(`${input} must contain a non-empty JSON array`);
}

// Collect every key that appears in any object, preserving first-seen order.
const columns = [];
for (const s of sermons) for (const k of Object.keys(s)) if (!columns.includes(k)) columns.push(k);

if (existsSync(output)) rmSync(output);
const db = new Database(output);
const quote = (c) => `"${c.replaceAll('"', '""')}"`;

db.exec(
  `CREATE TABLE sermons (
    ${columns.map((c) => `${quote(c)} TEXT`).join(",\n    ")}
  );
  CREATE INDEX sermons_date_idx ON sermons(date);`
);

const insert = db.prepare(
  `INSERT INTO sermons (${columns.map(quote).join(", ")})
   VALUES (${columns.map((c) => "@" + c).join(", ")})`
);
db.transaction((rows) => {
  for (const r of rows) insert.run(Object.fromEntries(columns.map((c) => [c, r[c] ?? null])));
})(sermons);

const { n } = db.prepare("SELECT COUNT(*) AS n FROM sermons").get();
db.close();
console.log(`Imported ${n} sermons into ${path.relative(process.cwd(), output)} (columns: ${columns.join(", ")})`);
