import type { PlayContext, SearchParams } from "./types";

/** Build a /player URL that remembers where playback was started from. */
export function playerHref(id: number, ctx: PlayContext): string {
  const params = new URLSearchParams({ id: String(id) });
  if (ctx.kind === "search") {
    params.set("src", "search");
    if (ctx.q) params.set("q", ctx.q);
    if (ctx.from) params.set("from", ctx.from);
    if (ctx.to) params.set("to", ctx.to);
  }
  return `/player?${params}`;
}

type RawParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
const isDate = (v?: string) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);

export function parseSearchParams(sp: RawParams): SearchParams {
  return { q: one(sp.q)?.slice(0, 200), from: isDate(one(sp.from)), to: isDate(one(sp.to)) };
}

export function parsePlayContext(sp: RawParams): PlayContext {
  return one(sp.src) === "search" ? { kind: "search", ...parseSearchParams(sp) } : { kind: "archive" };
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}
