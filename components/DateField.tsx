"use client";
import { useRef, useState } from "react";
import { formatDate } from "@/lib/links";

/**
 * A date filter that can't overflow on iOS.
 *
 * Every iOS browser (Safari, Chrome, …) uses WebKit, which sizes native date
 * inputs to its own width and ignores CSS width. So the visible box is drawn
 * by us, and the real <input type="date"> sits invisibly on top of it: it's
 * out of the layout (absolutely positioned) and clipped by the box, whatever
 * size the browser gives it. Tapping still opens the device's own date picker,
 * and the input still submits with the form under `name`.
 */
export default function DateField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const input = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    try {
      input.current?.showPicker?.(); // desktop browsers; iOS opens its picker on tap anyway
    } catch {}
  };

  return (
    <div className="date-field">
      <label className="date-label" htmlFor={`date-${name}`}>
        {label}
      </label>
      <div className="date-box">
        <span className={value ? "date-text" : "date-text placeholder"} aria-hidden>
          {value ? formatDate(value) : "Any date"}
        </span>
        {!value && (
          <svg className="date-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4 10h16M9 3v4M15 3v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
        <input
          ref={input}
          id={`date-${name}`}
          className="date-native"
          type="date"
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClick={openPicker}
        />
        {value && (
          <button type="button" className="date-clear" onClick={() => setValue("")} aria-label={`Clear ${label} date`}>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
