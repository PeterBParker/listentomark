import SermonList from "@/components/SermonList";
import { listSermons } from "@/lib/db";

// Archive view (home page).
export const dynamic = "force-dynamic";

export default function ArchivePage() {
  const sermons = listSermons();
  return (
    <>
      <h1 className="page-title">Archive</h1>
      <p className="page-sub">{sermons.length} sermons</p>
      <SermonList sermons={sermons} ctx={{ kind: "archive" }} />
    </>
  );
}
