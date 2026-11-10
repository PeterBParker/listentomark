"use client";
import { useEffect } from "react";
import { setLastSearch } from "@/lib/lastSearch";

/** Rendered by the Search page to record its current URL. */
export default function RememberSearch({ href }: { href: string }) {
  useEffect(() => setLastSearch(href), [href]);
  return null;
}
