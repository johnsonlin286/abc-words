import { useId } from "react";
import FingerSum from "./finger-sum";
import { formatPoints } from "@/shared/game";
import { CHAT_RULES, SCORE_NOTE, SCORE_ROWS, STEPS } from "./rules-content";

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 leading-relaxed text-ink-soft marker:text-ink-faint">
      {items.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  );
}

/**
 * The rules on the notebook: a worked example, each step of a round, points and chat rules.
 * Used by the /cara-main page and by the rules dialog inside a room. `headingLevel` is the
 * level of the headings inside (2 on the page under its h1, 3 in the dialog under its h2).
 */
export default function HowToPlay({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const pointsId = useId();
  const chatId = useId();

  return (
    <div className="flex flex-col gap-10">
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
              <H className="text-2xl leading-tight font-bold">{step.title}</H>
              <Bullets items={step.body} />
            </div>
          </li>
        ))}
      </ol>

      <section aria-labelledby={pointsId} className="note-card p-5 sm:p-6">
        <H id={pointsId} className="text-2xl font-bold">
          Poin
        </H>
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

      <section aria-labelledby={chatId}>
        <H id={chatId} className="text-2xl font-bold">
          Obrolan
        </H>
        <Bullets items={CHAT_RULES} />
      </section>
    </div>
  );
}
