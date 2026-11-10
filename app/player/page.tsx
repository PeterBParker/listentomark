import Link from "next/link";
import AudioPlayer from "@/components/AudioPlayer";
import { audioSources } from "@/lib/audio";
import { getNeighbors, getSermon, listSermons } from "@/lib/db";
import { formatDate, parsePlayContext, playerHref } from "@/lib/links";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PlayerPage({ searchParams }: Props) {
  const sp = await searchParams;
  const ctx = parsePlayContext(sp);
  // With no id, default to the most recent sermon.
  const id = Number(Array.isArray(sp.id) ? sp.id[0] : sp.id) || listSermons()[0]?.id;
  const sermon = id ? getSermon(id) : undefined;

  if (!sermon) {
    return (
      <p className="empty">
        Sermon not found. <Link href="/">Back to the archive</Link>
      </p>
    );
  }

  const { prev, next } = getNeighbors(sermon.id, ctx);
  const subtitle = [formatDate(sermon.date), sermon.series].filter(Boolean).join(" · ");

  return (
    <>
      <p className="page-sub">
        {ctx.kind === "search" ? "Playing from search results" : "Playing from the archive"}
      </p>
      <AudioPlayer
        key={sermon.id}
        title={sermon.title}
        subtitle={subtitle}
        sources={audioSources(sermon)}
        prevHref={prev && playerHref(prev.id, ctx)}
        nextHref={next && playerHref(next.id, ctx)}
      />
    </>
  );
}
