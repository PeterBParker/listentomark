"use client";
import { useSyncExternalStore } from "react";

// Remembers the most recent /search URL so the Search tab can return to it.
// Kept in memory for in-app navigation and in sessionStorage so it also
// survives a page refresh (per browser tab).
const KEY = "ltm:lastSearch";
let value: string | null = null;
const listeners = new Set<() => void>();

function read(): string {
  if (value === null) {
    try {
      value = sessionStorage.getItem(KEY) ?? "/search";
    } catch {
      value = "/search";
    }
  }
  return value;
}

export function setLastSearch(href: string) {
  if (href === read()) return;
  value = href;
  try {
    sessionStorage.setItem(KEY, href);
  } catch {}
  listeners.forEach((l) => l());
}

export function useLastSearch(): string {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    read,
    () => "/search"
  );
}
