import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans-family" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-mono-family" });

export const metadata: Metadata = {
  title: "Rule Test Bench · content rules you can trust",
  description:
    "Test LLM-judged content-rule descriptions against labeled example snippets, instantly, without reading anyone's documents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/70 backdrop-blur">
          <nav className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link href="/settings/rules" className="flex items-center gap-2 text-sm font-medium tracking-tight">
              <span aria-hidden className="grid h-6 w-6 place-items-center rounded-md bg-sky-400 text-[11px] font-bold text-slate-950">
                RT
              </span>
              <span>Rule Test Bench</span>
              <span className="hidden text-slate-500 sm:inline">· Northwind workspace</span>
            </Link>
            <div className="flex items-center gap-1 text-sm">
              <Link href="/settings/rules" className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-white/5 hover:text-white">
                Settings
              </Link>
              <Link href="/story" className="rounded-md px-3 py-1.5 text-slate-300 hover:bg-white/5 hover:text-white">
                Story
              </Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="mx-auto max-w-screen-xl px-4 py-10 text-xs text-slate-500 sm:px-6">
          Independent open-source project. All workspace content shown is synthetic.
        </footer>
      </body>
    </html>
  );
}
