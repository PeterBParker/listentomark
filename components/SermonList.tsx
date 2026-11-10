import { formatDate } from "@/lib/links";
import { basicTrack } from "@/lib/track";
import type { PlayContext, Sermon } from "@/lib/types";
import PlayButton from "./PlayButton";

/** Shared list used by the Archive and Search views. Rows expand (no JS) via <details>. */
export default function SermonList({ sermons, ctx }: { sermons: Sermon[]; ctx: PlayContext }) {
  if (sermons.length === 0) return <p className="empty">No sermons found.</p>;
  return (
    <ul className="sermon-list">
      {sermons.map((s) => (
        <li key={s.id} className="sermon">
          <details>
            <summary>
              <svg className="chevron" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="sermon-text">
                <span className="sermon-title">{s.title}</span>
                <span className="sermon-date">{formatDate(s.date)}</span>
              </span>
            </summary>
            <dl className="meta">
              {s.series && (<><dt>Series</dt><dd>{s.series}</dd></>)}
              {s.speaker && (<><dt>Speaker</dt><dd>{s.speaker}</dd></>)}
              <dt>Date</dt><dd>{s.date}</dd>
              {s.page_url && (
                <><dt>Page</dt><dd><a href={s.page_url} target="_blank" rel="noreferrer">alliancechurch.org ↗</a></dd></>
              )}
            </dl>
          </details>
          <PlayButton track={basicTrack(s, ctx)} />
        </li>
      ))}
    </ul>
  );
}
