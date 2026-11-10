"use client";
import { useRef, useState } from "react";
import type { Quote } from "@/lib/types";
import BibleIcon from "./BibleIcon";
import HeaderPhoto from "./HeaderPhoto";

const TAPS_NEEDED = 3;
const WINDOW_MS = 5000;

/**
 * Site header. Tapping the photo three times within five seconds opens a
 * speech bubble below the "Listen To Mark" row, showing a random row from the
 * quotes table. The photo slides down beneath the bubble's tail so it looks
 * like it's speaking.
 */
export default function SiteHeader() {
  const taps = useRef<number[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [open, setOpen] = useState(false);

  const showQuote = async () => {
    try {
      const res = await fetch("/api/quote", { cache: "no-store" });
      if (!res.ok) return;
      setQuote(await res.json());
      setOpen(true);
    } catch {}
  };

  const onPhotoTap = () => {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < WINDOW_MS), now];
    if (taps.current.length >= TAPS_NEEDED) {
      taps.current = [];
      void showQuote();
    }
  };

  return (
    <>
      {/* The title row always stays at the top of the page. */}
      <header className="site-header">
        <BibleIcon size={26} className="brand-icon" />
        <span className="brand">Listen To Mark</span>
      </header>
      <div className={open ? "quote-area open" : "quote-area"} aria-live="polite" inert={!open}>
        <div className="quote-clip">
          <div className="quote-pad">
            {quote && (
              <figure className="quote-bubble">
                <blockquote>
                  <p className="quote-line">
                    <em>“{quote.text}”</em>
                    {/* Space outside the span: the line may break before the hyphen, never inside "- Source". */}
                    {quote.source && <> <span className="quote-source">- {quote.source}</span></>}
                  </p>
                  {quote.reason && <p className="quote-reason">{quote.reason}</p>}
                </blockquote>
                <button type="button" className="quote-close" onClick={() => setOpen(false)} aria-label="Close quote">
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </figure>
            )}
          </div>
        </div>
      </div>
      {/* The photo hangs from here, just below the bubble, so it moves down
          with the bubble and stays under its tail. */}
      <div className={open ? "photo-anchor open" : "photo-anchor"}>
        <HeaderPhoto onTap={onPhotoTap} />
      </div>
    </>
  );
}
