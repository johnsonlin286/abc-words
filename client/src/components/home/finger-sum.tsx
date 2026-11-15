import { MoveRight } from "lucide-react";
import { Sparks } from "./doodles";

/** Hand-drawn loop the teacher circles the letter with (path length normalised to 1 for the draw-in). */
function PenCircle() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 110"
      className="pointer-events-none absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] overflow-visible"
    >
      <path
        data-anim="circle"
        pathLength={1}
        strokeDasharray="1"
        d="M92 18C74 4 34 6 18 30C3 53 12 88 46 98C80 108 112 88 110 54C108 30 92 14 66 12"
        fill="none"
        stroke="var(--color-redpen)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Tally strokes for a number of raised fingers, five to a hand. */
function Fingers({ count }: { count: number }) {
  return (
    <span className="flex h-5 items-end gap-[3px]">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          data-anim="finger"
          className={`w-[3px] origin-bottom rounded-full bg-ink-soft ${i === 5 ? "ml-1.5" : ""}`}
          style={{ height: [12, 17, 20, 17, 11][i % 5] }}
        />
      ))}
    </span>
  );
}

/**
 * One part of the sum, in three rows (fingers / value / caption) so that numbers, "+" and "="
 * all sit on the same line, whatever is above or below them.
 */
function Term({
  top,
  children,
  bottom,
  anim,
}: {
  top?: React.ReactNode;
  children: React.ReactNode;
  bottom?: React.ReactNode;
  anim: string;
}) {
  return (
    <span className="flex flex-col items-center gap-1">
      <span className="flex h-5 items-end">{top}</span>
      <span
        data-anim={anim}
        className="flex h-12 items-center text-4xl leading-none font-bold tabular-nums sm:h-14 sm:text-5xl"
      >
        {children}
      </span>
      <span data-anim={bottom ? "caption" : undefined} className="h-4 text-xs leading-4 font-medium text-ink-soft">
        {bottom}
      </span>
    </span>
  );
}

const Sign = ({ children }: { children: string }) => (
  <Term anim="sign">
    <span className="text-3xl text-ink-faint">{children}</span>
  </Term>
);

const PLAYERS = [
  { name: "Budi", value: 3 },
  { name: "Sari", value: 5 },
  { name: "Andi", value: 2 },
];

/**
 * The whole game in one line, written in the notebook: everyone's fingers add up to a number,
 * the number is a letter. The letter gets stamped and circled in red pen (see hero-motion.tsx).
 */
export default function FingerSum() {
  const total = PLAYERS.reduce((sum, p) => sum + p.value, 0);
  const letter = String.fromCharCode(64 + total);

  return (
    <figure className="flex flex-wrap items-center gap-x-6 gap-y-5">
      <figcaption className="sr-only">
        Contoh: Budi 3 jari, Sari 5 jari, Andi 2 jari. Jumlahnya {total}, huruf ke-{total} adalah {letter}.
      </figcaption>

      <span aria-hidden className="flex items-start gap-2.5 sm:gap-3.5">
        {PLAYERS.map((p, i) => (
          <span key={p.name} className="contents">
            {i > 0 && <Sign>+</Sign>}
            <Term anim="number" top={<Fingers count={p.value} />} bottom={p.name}>
              {p.value}
            </Term>
          </span>
        ))}
        <Sign>=</Sign>
        <Term anim="total" bottom="jumlah">
          {total}
        </Term>
      </span>

      <span aria-hidden className="flex items-center gap-4">
        <MoveRight data-anim="arrow" className="hidden size-9 text-ink sm:block" strokeWidth={2.75} />
        <span className="flex flex-col items-center">
          <span data-anim="letter" className="relative px-2 text-7xl leading-none font-bold text-redpen sm:text-8xl">
            {letter}
            <PenCircle />
            <Sparks className="-top-3 -right-4 size-7 -scale-x-100" color="var(--color-highlight)" />
          </span>
          <span
            data-anim="note"
            className="mt-4 -rotate-2 rounded-sm bg-highlight px-2.5 py-0.5 font-hand text-lg leading-snug whitespace-nowrap text-ink"
          >
            Huruf ronde ini: {letter}
          </span>
        </span>
      </span>
    </figure>
  );
}
