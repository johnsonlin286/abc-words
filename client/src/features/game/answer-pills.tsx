import type { GameRoomView } from "@/stores/room-store";

/**
 * The answers so far as small pills, newest first (same as the app), so the word just taken is
 * the first thing a player sees: those words can't be used again.
 */
export default function AnswerPills({ room }: { room: GameRoomView }) {
  const answers = [...room.state.answers].reverse();

  if (answers.length === 0) {
    return <p className="text-sm font-medium text-ink-faint">Belum ada jawaban masuk.</p>;
  }
  return (
    <div aria-live="polite" className="flex flex-wrap items-center gap-2">
      <h3 className="text-sm font-bold">Sudah dipakai:</h3>
      <ul className="contents">
        {answers.map((a) => (
          <li
            key={a.userId}
            className="ink-appear inline-flex max-w-full items-baseline gap-1.5 rounded-full border-2 border-paper-line bg-white px-2.5 py-0.5"
          >
            <span className="min-w-0 text-sm font-bold break-words">{a.text}</span>
            <span className="max-w-20 truncate text-xs font-medium text-ink-soft">{a.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
