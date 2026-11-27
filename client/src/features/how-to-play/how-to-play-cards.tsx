"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { SLIDES } from "./slides";

/**
 * Cara bermain, short (same as the app): six cards to swipe, one picture and one sentence each, so
 * nobody has to read a page of rules. Swiping uses native scroll snapping; "Lanjut" moves on, the last
 * card offers "Main Sekarang" and "Ulangi dari Awal", and "Aturan Lengkap" opens every rule.
 */
export default function HowToPlayCards() {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
    setIndex(i);
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget;
          const next = Math.round(el.scrollLeft / el.clientWidth);
          if (next !== index) setIndex(next);
        }}
        aria-roledescription="carousel"
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((slide, i) => (
          <section
            key={slide.key}
            aria-roledescription="slide"
            aria-label={`Langkah ${i + 1} dari ${SLIDES.length}`}
            aria-hidden={i !== index}
            className="flex w-full shrink-0 snap-center flex-col justify-center gap-8 px-1"
          >
            <div className="flex min-h-[220px] items-center justify-center">
              {/* Remounted when the card comes into view, so its entrance plays again. */}
              <slide.Illustration key={i === index ? "active" : "idle"} active={i === index} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">{slide.title}</h2>
              <p className="text-lg leading-relaxed text-ink-soft">{slide.text}</p>
            </div>
          </section>
        ))}
      </div>

      <div aria-hidden className="flex justify-center gap-2">
        {SLIDES.map((s, i) => (
          <span key={s.key} className={`h-2.5 rounded-full ${i === index ? "w-6 bg-ink" : "w-2.5 bg-ink-faint"}`} />
        ))}
      </div>

      {last ? (
        <Link href="/#mulai" className={`${buttonPrimary} py-3 text-lg`}>
          Main Sekarang
        </Link>
      ) : (
        <button type="button" onClick={() => goTo(index + 1)} className={`${buttonPrimary} py-3 text-lg`}>
          Lanjut
        </button>
      )}
      {last && (
        <button type="button" onClick={() => goTo(0)} className={buttonSecondary}>
          <RotateCcw aria-hidden className="size-4" strokeWidth={2.5} />
          Ulangi dari Awal
        </button>
      )}
      <Link
        href="/cara-main/lengkap"
        className="self-center rounded-sm font-semibold underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen"
      >
        Aturan Lengkap
      </Link>
    </div>
  );
}
