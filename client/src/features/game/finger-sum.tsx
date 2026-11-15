import { MoveRight } from "lucide-react";
import Image from "next/image";
import { Sparks } from "@/components/home/doodles";
import PenCircle from "@/components/pen-circle";
import { HANDS } from "./hands";

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
      <span className="flex h-12 items-end sm:h-14">{top}</span>
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
 * the number is a letter, circled in red pen. Shown with the rules (page and in-room dialog).
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
            <Term anim="number" top={<Image src={HANDS[p.value - 1]} alt="" sizes="60px" className="h-full w-auto" />} bottom={p.name}>
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
            <PenCircle anim="circle" />
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
