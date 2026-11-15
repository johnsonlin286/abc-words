import { Play } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FingerSum from "@/components/home/finger-sum";
import { buttonPrimary } from "@/components/ui";
import { CHAT_RULES, SCORE_NOTE, SCORE_ROWS, STEPS } from "@/features/game/rules-content";
import { formatPoints } from "@/shared/game";
import logo from "../../../../public/logo.png";

export const metadata: Metadata = { title: "Cara bermain · ABC Lima Dasar" };

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 leading-relaxed text-ink-soft marker:text-ink-faint">
      {items.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

/** The rules written out on the notebook: a worked example first, then each step of a round. */
export default function HowToPlayPage() {
  return (
    <article className="flex w-full flex-col gap-10">
      <header className="flex flex-col gap-6">
        <Link href="/" aria-label="ABC Lima Dasar, ke beranda" className="w-fit rounded-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-redpen">
          <Image src={logo} alt="" sizes="180px" className="h-9 w-auto sm:h-10" />
        </Link>
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl leading-tight font-bold sm:text-6xl">
            <span className="relative isolate inline-block">
              <span
                aria-hidden
                className="absolute -inset-x-2 top-[42%] bottom-1 -z-10 -rotate-1 rounded-[0.4em_0.2em_0.5em_0.25em] bg-highlight"
              />
              Cara bermain
            </span>
          </h1>
          <p className="max-w-[40ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
            Hitung jari, dapat huruf, adu kata! Satu ronde <span className="whitespace-nowrap">kira-kira</span> begini:
          </p>
        </div>
      </header>

      <figure className="note-card flex flex-col gap-4 p-5 sm:p-6">
        <p className="w-fit -rotate-1 rounded-sm bg-highlight-soft px-2.5 font-hand text-lg">Contoh satu ronde</p>
        <FingerSum />
        <p className="text-sm leading-relaxed text-ink-soft">
          Budi, Sari dan Andi menunjukkan 3, 5 dan 2. Jumlahnya 10, huruf ke-10 adalah J. Sekarang semua adu cepat
          menulis kata berawalan J, misalnya &ldquo;Jerapah&rdquo; untuk kategori Hewan.
        </p>
      </figure>

      <ol className="flex flex-col gap-8">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span
              aria-hidden
              className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-highlight text-xl font-bold shadow-[2px_2px_0_var(--color-ink)]"
            >
              {i + 1}
            </span>
            <div className="min-w-0 pt-1.5">
              <h2 className="text-2xl leading-tight font-bold">{step.title}</h2>
              <Bullets items={step.body} />
            </div>
          </li>
        ))}
      </ol>

      <section aria-labelledby="poin" className="note-card p-5 sm:p-6">
        <h2 id="poin" className="text-2xl font-bold">
          Poin
        </h2>
        <table className="mt-3 w-full">
          <tbody>
            {SCORE_ROWS.map((row) => (
              <tr key={row.label} className="border-b-2 border-paper-line last:border-0">
                <td className="py-2.5 pr-4 leading-snug text-ink-soft">{row.label}</td>
                <td
                  className={`py-2.5 text-right text-xl font-bold tabular-nums ${row.points > 0 ? "text-success" : "text-redpen"}`}
                >
                  {formatPoints(row.points)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 font-hand text-lg leading-snug text-redpen">{SCORE_NOTE}</p>
      </section>

      <section aria-labelledby="obrolan">
        <h2 id="obrolan" className="text-2xl font-bold">
          Obrolan
        </h2>
        <Bullets items={CHAT_RULES} />
      </section>

      <div className="flex flex-col items-start gap-3 border-t-2 border-dashed border-ink-faint pt-8">
        <p className="text-xl font-bold">Sudah paham? Ajak temanmu!</p>
        <Link href="/#mulai" className={`${buttonPrimary} px-6 py-3 text-lg`}>
          <Play aria-hidden className="size-5 fill-current" strokeWidth={2.5} />
          Main sekarang
        </Link>
      </div>
    </article>
  );
}
