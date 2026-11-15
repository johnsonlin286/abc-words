import { formatPoints } from "@/shared/game";
import { chalkFont } from "./fonts";
import { CHAT_RULES, SCORE_NOTE, SCORE_ROWS, STEPS } from "./rules-content";

/** Game rules on the chalkboard: the in-room rules dialog (the /cara-main page has its own layout). */
export default function HowToPlay({ headingLevel = 1 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const Sub = headingLevel === 1 ? "h2" : "h3";

  return (
    <div className="space-y-5 text-chalk">
      <Heading className={`${chalkFont.className} text-3xl`}>Cara main</Heading>

      <ol className="space-y-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span
              aria-hidden
              className={`${chalkFont.className} w-6 shrink-0 text-2xl leading-7 text-chalk-yellow`}
            >
              {i + 1}
            </span>
            <div>
              <Sub className="font-medium">{step.title}</Sub>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-chalk-dim marker:text-chalk-dim/60">
                {step.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <section>
        <Sub className="mb-2 font-medium">Obrolan</Sub>
        <ul className="list-disc space-y-1 pl-4 text-sm text-chalk-dim marker:text-chalk-dim/60">
          {CHAT_RULES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section>
        <Sub className="mb-2 font-medium">Poin</Sub>
        <table className="w-full text-sm">
          <tbody>
            {SCORE_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-chalk-dim/20 last:border-0">
                <td className="py-1.5 pr-3 text-chalk-dim">{row.label}</td>
                <td
                  className={`py-1.5 text-right font-medium tabular-nums ${row.points > 0 ? "text-chalk-yellow" : "text-chalk-pink"}`}
                >
                  {formatPoints(row.points)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-sm text-chalk-dim">
          {SCORE_NOTE}
        </p>
      </section>
    </div>
  );
}
