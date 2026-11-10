"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Archive" },
  { href: "/search", label: "Search" },
  { href: "/player", label: "Player" },
];

export default function NavBar() {
  const path = usePathname();
  return (
    <nav className="tabs">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className={path === t.href ? "active" : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
