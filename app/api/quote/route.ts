import { getRandomQuote } from "@/lib/db";

// A different random quote on every request: never prerender or cache this.
export const dynamic = "force-dynamic";

export function GET() {
  const quote = getRandomQuote();
  if (!quote) return Response.json({ error: "No quotes" }, { status: 404 });
  return Response.json(quote, { headers: { "cache-control": "no-store" } });
}
