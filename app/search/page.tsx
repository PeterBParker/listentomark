import SermonList from "@/components/SermonList";
import { searchSermons } from "@/lib/db";
import { parseSearchParams } from "@/lib/links";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// Plain GET form: works without JavaScript and every search has a shareable URL.
export default async function SearchPage({ searchParams }: Props) {
  const params = parseSearchParams(await searchParams);
  const hasQuery = Boolean(params.q || params.from || params.to);
  const results = hasQuery ? searchSermons(params) : [];

  return (
    <>
      <h1 className="page-title">Search</h1>
      <form className="search-form" action="/search">
        <input type="search" name="q" defaultValue={params.q} placeholder="Titles, series…" autoComplete="off" />
        <div className="date-row">
          <label>
            From <input type="date" name="from" defaultValue={params.from} />
          </label>
          <label>
            To <input type="date" name="to" defaultValue={params.to} />
          </label>
        </div>
        <button type="submit">Search</button>
      </form>
      {hasQuery && (
        <>
          <p className="page-sub">
            {results.length} result{results.length === 1 ? "" : "s"}
          </p>
          <SermonList sermons={results} ctx={{ kind: "search", ...params }} />
        </>
      )}
    </>
  );
}
