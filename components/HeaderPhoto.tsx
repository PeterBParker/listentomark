"use client";
import Image from "next/image";
import { useRef } from "react";

/**
 * Dr. Mark Harris's photo in the header. The outer button keeps the slow
 * back-and-forth tilt going the whole time; tapping makes the photo inside
 * wiggle on top of it. Because the tilt is never interrupted, it carries on
 * from exactly where it was once the wiggle ends.
 */
export default function HeaderPhoto({ onTap }: { onTap?: () => void }) {
  const photo = useRef<HTMLImageElement>(null);

  const wiggle = () => {
    const el = photo.current;
    if (!el) return;
    el.classList.remove("wiggle");
    void el.offsetWidth; // restart the animation if tapped again mid-wiggle
    el.classList.add("wiggle");
    onTap?.();
  };

  return (
    <button type="button" className="header-photo" onClick={wiggle} aria-label="Wiggle Dr. Mark Harris">
      <Image
        ref={photo}
        src="/mark-harris.webp"
        alt="Dr. Mark Harris"
        width={66}
        height={84}
        loading="eager"
        onAnimationEnd={(e) => e.currentTarget.classList.remove("wiggle")}
      />
    </button>
  );
}
