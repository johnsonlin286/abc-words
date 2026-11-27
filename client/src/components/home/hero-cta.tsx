"use client";

import { BookOpen, Play } from "lucide-react";
import Link from "next/link";
import { buttonGhost, buttonPrimary } from "@/components/ui";

/** Id of the sign-in / lobby card the main button jumps to. */
export const START_ID = "mulai";

/**
 * Two ways out of the hero: start playing (scroll to the name field or the lobby and focus it),
 * or read the rules first.
 */
export default function HeroCta() {
  function start(event: React.MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(START_ID);
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    target.querySelector<HTMLElement>("input:not([disabled]), button:not([disabled])")?.focus({ preventScroll: true });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <a href={`#${START_ID}`} onClick={start} className={`${buttonPrimary} px-6 py-3 text-lg sm:w-auto`}>
        <Play aria-hidden className="size-5 fill-current" strokeWidth={2.5} />
        Main Sekarang
      </a>
      <Link href="/cara-main" className={`${buttonGhost} py-3 text-lg`}>
        <BookOpen aria-hidden className="size-5" strokeWidth={2.5} />
        Cara Bermain
      </Link>
    </div>
  );
}
