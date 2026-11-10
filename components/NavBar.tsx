"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLastSearch } from "@/lib/lastSearch";
import { usePlayer } from "./PlayerProvider";

export default function NavBar() {
  const path = usePathname();
  const { current, playing } = usePlayer();
  const lastSearch = useLastSearch();
  const tabs = [
    { href: "/", match: "/", label: "Archive" },
    // Return to the last search (query, dates and results).
    { href: lastSearch, match: "/search", label: "Search" },
    // Return to whatever is loaded, keeping its archive/search context.
    { href: current?.href ?? "/player", match: "/player", label: playing ? "▶ Playing" : "Player" },
  ];
  return (
    <nav className="tabs">
      {tabs.map((t) => (
        <Link key={t.match} href={t.href} className={path === t.match ? "active" : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
