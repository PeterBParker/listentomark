import type { Metadata, Viewport } from "next";
import Image from "next/image";
import BibleIcon from "@/components/BibleIcon";
import NavBar from "@/components/NavBar";
import PlayerProvider from "@/components/PlayerProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Listen To Mark",
  description: "Browse and play sermons by Dr. Robert Mark Harris.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f6f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <BibleIcon size={26} className="brand-icon" />
          <span className="brand">Listen To Mark</span>
          <Image
            className="header-photo"
            src="/mark-harris.webp"
            alt="Dr. Mark Harris"
            width={66}
            height={84}
            loading="eager"
          />
        </header>
        <PlayerProvider>
          <main>{children}</main>
          <NavBar />
        </PlayerProvider>
      </body>
    </html>
  );
}
