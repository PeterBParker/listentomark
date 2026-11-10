"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlayer } from "./PlayerProvider";

export default function NavBar() {
  const path = usePathname();
  const { current, playing } = usePlayer();
  const tabs = [
    { href: "/", match: "/", label: "Archive" },
    { href: "/search", match: "/search", label: "Search" },
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
