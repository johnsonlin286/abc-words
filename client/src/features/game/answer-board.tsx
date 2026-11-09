import type { GameRoomView } from "@/stores/room-store";
import { chalkFont } from "./fonts";

/** Answers so far, plus the players still expected to answer. */
export default function AnswerBoard({ room }: { room: GameRoomView }) {
  const { answers } = room.state;
  const notAnswered = room.members.filter((m) => !answers.some((a) => a.userId === m.userId));

  return (
    <section aria-labelledby="answers-heading" className="space-y-2">
      <h3 id="answers-heading" className={`${chalkFont.className} text-2xl text-chalk`}>
        Jawaban masuk
      </h3>

      {answers.length === 0 ? (
        <p className="text-sm text-chalk-dim">Belum ada jawaban.</p>
      ) : (
        <ol aria-live="polite" className="space-y-1">
          {answers.map((a) => (
            <li key={a.userId} className="flex items-baseline justify-between gap-3 rounded-md bg-board-deep px-3 py-2">
              <span className="min-w-0 font-medium break-words text-chalk">{a.text}</span>
              <span className="shrink-0 text-xs text-chalk-dim">{a.name}</span>
            </li>
          ))}
        </ol>
      )}

      {notAnswered.length > 0 && (
        <p className="text-sm text-chalk-dim">
          Belum menjawab: {notAnswered.map((m) => (m.isConnected ? m.name : `${m.name} (terputus)`)).join(", ")}
        </p>
      )}
    </section>
  );
}
