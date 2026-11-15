import type { GameRoomView } from "@/stores/room-store";

/** Answers so far. */
export default function AnswerBoard({ room }: { room: GameRoomView }) {
  const { answers } = room.state;

  return (
    <section aria-labelledby="answers-heading" className="space-y-2">
      <h3 id="answers-heading" className="text-lg font-bold">
        Jawaban masuk
      </h3>

      {answers.length === 0 ? (
        <p className="text-sm font-medium text-ink-faint">Belum ada jawaban.</p>
      ) : (
        <ol aria-live="polite" className="flex flex-col">
          {answers.map((a) => (
            <li key={a.userId} className="ink-appear flex items-baseline justify-between gap-3 border-b-2 border-paper-line py-2">
              <span className="min-w-0 text-lg font-bold break-words">{a.text}</span>
              <span className="shrink-0 text-sm font-medium text-ink-soft">{a.name}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
