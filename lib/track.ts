import "server-only";
import { audioSources } from "./audio";
import { getNeighbors } from "./db";
import { formatDate, playerHref } from "./links";
import type { PlayContext, Sermon, Track } from "./types";

export function trackSubtitle(s: Sermon): string {
  return [formatDate(s.date), s.series].filter(Boolean).join(" · ");
}

/** Track info without neighbours (cheap; used by list play buttons). */
export function basicTrack(s: Sermon, ctx: PlayContext): Track {
  return { id: s.id, title: s.title, subtitle: trackSubtitle(s), sources: audioSources(s), href: playerHref(s.id, ctx) };
}

/** Full track info, including previous/next for the given play context. */
export function buildTrack(s: Sermon, ctx: PlayContext): Track {
  const { prev, next } = getNeighbors(s.id, ctx);
  return {
    ...basicTrack(s, ctx),
    prevHref: prev && playerHref(prev.id, ctx),
    nextHref: next && playerHref(next.id, ctx),
  };
}
