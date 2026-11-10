import Link from "next/link";
import PlayerView from "@/components/PlayerView";
import { getSermon, listSermons } from "@/lib/db";
import { parsePlayContext } from "@/lib/links";
import { buildTrack } from "@/lib/track";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PlayerPage({ searchParams }: Props) {
  const sp = await searchParams;
  const ctx = parsePlayContext(sp);
  const rawId = Array.isArray(sp.id) ? sp.id[0] : sp.id;
  const sermon = rawId ? getSermon(Number(rawId)) : undefined;

  if (rawId && !sermon) {
    return (
      <p className="empty">
        Sermon not found. <Link href="/">Back to the archive</Link>
      </p>
    );
  }

  // No id: the client shows whatever is loaded, falling back to the newest sermon.
  const latest = listSermons()[0];
  if (!sermon && !latest) return <p className="empty">No sermons yet.</p>;

  return (
    <PlayerView
      track={sermon && buildTrack(sermon, ctx)}
      fallback={buildTrack(sermon ?? latest, { kind: "archive" })}
    />
  );
}
