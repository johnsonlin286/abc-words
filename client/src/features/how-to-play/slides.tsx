"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState, type JSX } from "react";
import bronze from "@/assets/trophies/bronze.webp";
import gold from "@/assets/trophies/gold.webp";
import silver from "@/assets/trophies/silver.webp";
import FingerSum from "@/features/game/finger-sum";
import { HANDS } from "@/features/game/hands";
import VerifiedBadge from "@/features/game/verified-badge";
import { ANSWER_MS, POINTS, formatPoints } from "@/shared/game";

/**
 * The six "Cara bermain" cards, the same as the app's how-to-play-slides.tsx: one picture and one
 * short sentence each. Each picture is only drawn on the card in view and is remounted when the card
 * comes back, so its CSS entrance plays again; all of it is still under reduced motion (globals.css).
 */
type IllustrationProps = { active: boolean };

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Hand({ value, height, rotate, delay }: { value: number; height: number; rotate: number; delay: number }) {
  return (
    <span className="pop-in inline-block" style={{ animationDelay: `${delay}ms` }}>
      <Image src={HANDS[value - 1]!} alt="" sizes="120px" style={{ height, width: "auto", rotate: `${rotate}deg` }} />
    </span>
  );
}

function Fingers({ active }: IllustrationProps) {
  if (!active) return null;
  return (
    <div className="flex items-end gap-3">
      <Hand value={2} height={96} rotate={-10} delay={0} />
      <Hand value={5} height={120} rotate={0} delay={150} />
      <Hand value={10} height={96} rotate={8} delay={300} />
    </div>
  );
}

function Sum({ active }: IllustrationProps) {
  if (!active) return null;
  return (
    <div className="ink-appear">
      <FingerSum />
    </div>
  );
}

const WORD = "Jerapah";
const DEMO_TOTAL_MS = ANSWER_MS;
/** The demo clock runs 8× fast and stops here, so the bar shows a round in progress. */
const DEMO_STOP_MS = 12_000;

/** The answering screen in miniature: the word types itself while the clock runs. */
function Answering({ active }: IllustrationProps) {
  const [left, setLeft] = useState(() => (reducedMotion() ? DEMO_STOP_MS : DEMO_TOTAL_MS));
  const [typed, setTyped] = useState(() => (reducedMotion() ? WORD.length : 0));

  useEffect(() => {
    if (!active || reducedMotion()) return;
    let clock = DEMO_TOTAL_MS;
    const timer = setInterval(() => {
      clock = Math.max(clock - 1_000, DEMO_STOP_MS);
      setLeft(clock);
      setTyped((t) => Math.min(t + 1, WORD.length));
      if (clock === DEMO_STOP_MS) clearInterval(timer);
    }, 125);
    return () => clearInterval(timer);
  }, [active]);

  if (!active) return null;
  return (
    <div aria-hidden className="note-card ink-appear flex w-full flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <span className="flex w-14 flex-col items-center">
          <span className="text-xs font-semibold tracking-wide text-ink-soft uppercase">Huruf</span>
          <span className="text-5xl leading-none font-bold text-redpen">J</span>
        </span>
        <span>
          <span className="block text-xl font-bold">
            Ronde 1 <span className="text-ink-faint">dari 5</span>
          </span>
          <span className="block font-medium text-ink-soft">
            Kategori: <span className="rounded-sm bg-highlight-soft px-1 font-bold text-ink">Hewan</span>
          </span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="h-3.5 flex-1 overflow-hidden rounded-full border-2 border-ink bg-white">
          <span className="block h-full rounded-full bg-highlight" style={{ width: `${(left / DEMO_TOTAL_MS) * 100}%` }} />
        </span>
        <span className="w-8 text-right text-xl font-bold tabular-nums">{Math.ceil(left / 1000)}</span>
      </div>
      <div className="flex gap-2">
        <span className="flex-1 rounded-xl border-2 border-ink bg-white px-3 py-2 text-lg">
          {WORD.slice(0, typed)}
          <span className="text-ink-faint">|</span>
        </span>
        <span className="grid place-items-center rounded-xl border-2 border-ink bg-highlight px-4 font-semibold shadow-[3px_3px_0_var(--color-ink)]">
          Kirim
        </span>
      </div>
    </div>
  );
}

function Voting({ active }: IllustrationProps) {
  if (!active) return null;
  return (
    <div aria-hidden className="note-card flex w-full flex-col px-4 py-2">
      <div className="ink-appear flex items-center justify-between border-b border-paper-line py-3">
        <span className="text-lg font-semibold">Jerapah</span>
        <span className="pop-in" style={{ animationDelay: "400ms" }}>
          <VerifiedBadge />
        </span>
      </div>
      <div className="ink-appear flex items-center justify-between py-3" style={{ animationDelay: "200ms" }}>
        <span className="relative text-lg font-semibold text-ink-soft">
          Jeruk
          {/* A red-pen line drawn across the failed answer, tilted like a pen stroke. */}
          <span className="absolute inset-x-[-4px] top-1/2 -rotate-12">
            <span className="strike-draw block h-[2.5px] bg-redpen" style={{ animationDelay: "800ms" }} />
          </span>
        </span>
        <span className="ink-appear font-hand text-lg text-redpen" style={{ animationDelay: "1100ms" }}>
          bukan kategori
        </span>
      </div>
    </div>
  );
}

function Points({ active }: IllustrationProps) {
  if (!active) return null;
  const rows = [
    { label: "Lolos", points: POINTS.accepted },
    { label: "Gugur", points: POINTS.rejected },
    { label: "Tidak menjawab", points: POINTS.noAnswer },
  ];
  return (
    <div aria-hidden className="note-card w-full px-4 py-1">
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="slide-in-right flex items-center justify-between border-b-2 border-paper-line py-3 last:border-0"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          <span className="text-lg font-medium text-ink-soft">{row.label}</span>
          <span className={`text-2xl font-bold ${row.points > 0 ? "text-success" : "text-redpen"}`}>
            {formatPoints(row.points)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Trophy({ src, height, name, delay }: { src: StaticImageData; height: number; name: string; delay: number }) {
  return (
    <span className="pop-in flex flex-col items-center gap-1" style={{ animationDelay: `${delay}ms` }}>
      <Image src={src} alt="" sizes="100px" style={{ height, width: "auto" }} />
      <span className="text-sm font-semibold text-ink-soft">{name}</span>
    </span>
  );
}

function Winners({ active }: IllustrationProps) {
  if (!active) return null;
  // Bronze, then silver, then the winner last. Silver and bronze are drawn smaller on purpose.
  return (
    <div aria-hidden className="flex items-end gap-4">
      <Trophy src={silver} height={84} name="Sari" delay={200} />
      <Trophy src={gold} height={112} name="Budi" delay={450} />
      <Trophy src={bronze} height={72} name="Andi" delay={0} />
    </div>
  );
}

export type Slide = {
  key: string;
  title: string;
  text: string;
  Illustration: (props: IllustrationProps) => JSX.Element | null;
};

/** The whole game in six cards (same words as the app). Details live in "Aturan lengkap". */
export const SLIDES: Slide[] = [
  { key: "fingers", title: "Tunjukkan jari", text: "Semua pemain memilih angka 1 sampai 10.", Illustration: Fingers },
  { key: "letter", title: "Dapat huruf", text: "Semua angka dijumlahkan, lalu dihitung dari A: 1 = A, 10 = J.", Illustration: Sum },
  {
    key: "answer",
    title: "Adu cepat menulis",
    text: `Tulis kata berawalan huruf itu dalam ${ANSWER_MS / 1000} detik. Hewan + J? Jerapah!`,
    Illustration: Answering,
  },
  {
    key: "vote",
    title: "Nilai bersama",
    text: "Jawaban aneh? Tolak bareng. Yang ada di kamus langsung lolos.",
    Illustration: Voting,
  },
  {
    key: "points",
    title: "Kumpulkan poin",
    text: `Lolos ${formatPoints(POINTS.accepted)}, gugur atau tidak menjawab ${formatPoints(POINTS.noAnswer)}.`,
    Illustration: Points,
  },
  { key: "win", title: "Jadi juara!", text: "Poin terbanyak setelah ronde terakhir menang.", Illustration: Winners },
];
