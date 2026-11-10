import { getSermon } from "@/lib/db";
import { parsePlayContext } from "@/lib/links";
import { buildTrack } from "@/lib/track";

// Used by the persistent player to load previous/next tracks (e.g. auto-advance
// while the user is on another page). Takes the same query string as /player.
export function GET(request: Request) {
  const sp = Object.fromEntries(new URL(request.url).searchParams);
  const sermon = getSermon(Number(sp.id));
  if (!sermon) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(buildTrack(sermon, parsePlayContext(sp)));
}
