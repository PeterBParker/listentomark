import { getSermon } from "@/lib/db";

// Streams a sermon's Google Drive backup (backup_audio_loc) through this server.
//
// Browsers can't play Drive links directly from another site: Drive answers
// cross-site media requests with 403 and sends `Cross-Origin-Resource-Policy:
// same-site`. Fetched from the server, the same URL returns the audio, so the
// player uses this same-origin route instead. Only URLs stored in the database
// are fetched, never arbitrary ones.

const PASS_THROUGH = ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "etag"];

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = getSermon(Number(id))?.backup_audio_loc;
  if (!url) return new Response("Not found", { status: 404 });

  const range = request.headers.get("range");
  let upstream: Response;
  try {
    upstream = await fetch(url, { headers: range ? { Range: range } : {}, signal: request.signal });
  } catch {
    return new Response("Backup audio unavailable", { status: 502 });
  }
  if (upstream.status === 416) return new Response(null, { status: 416, headers: copy(upstream) });
  // Anything but audio (e.g. a Drive error or sign-in page) counts as a failure.
  if (!upstream.ok || !upstream.headers.get("content-type")?.startsWith("audio/")) {
    await upstream.body?.cancel();
    return new Response("Backup audio unavailable", { status: 502 });
  }

  const headers = copy(upstream);
  headers.set("cache-control", "public, max-age=86400");
  return new Response(upstream.body, { status: upstream.status, headers });
}

function copy(upstream: Response): Headers {
  const headers = new Headers();
  for (const h of PASS_THROUGH) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  return headers;
}
