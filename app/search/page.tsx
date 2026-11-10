import Form from "next/form";
import DateField from "@/components/DateField";
import RememberSearch from "@/components/RememberSearch";
import SermonList from "@/components/SermonList";
import { searchSermons } from "@/lib/db";
import { parseSearchParams } from "@/lib/links";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// GET form: every search has a shareable URL. next/form submits without a full
// page reload (so audio keeps playing) and still works without JavaScript.
export default async function SearchPage({ searchParams }: Props) {
  const params = parseSearchParams(await searchParams);
  const hasQuery = Boolean(params.q || params.from || params.to);
  const results = hasQuery ? searchSermons(params) : [];
  const query = new URLSearchParams(
    Object.entries(params).filter((e): e is [string, string] => Boolean(e[1]))
  ).toString();
  const href = query ? `/search?${query}` : "/search";

  return (
    <>
      <RememberSearch href={href} />
      <h1 className="page-title">Search</h1>
      {/* key: remount so the inputs show the current search after navigating */}
      <Form key={href} className="search-form" action="/search">
        <input type="search" name="q" defaultValue={params.q} placeholder="Titles, series…" autoComplete="off" />
        <div className="date-row">
          <DateField name="from" label="From" defaultValue={params.from} />
          <DateField name="to" label="To" defaultValue={params.to} />
        </div>
        <button type="submit" className="submit">Search</button>
      </Form>
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
