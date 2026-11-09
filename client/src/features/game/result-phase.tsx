import type { GameRoomView } from "@/stores/room-store";
import RoundHeader from "./round-header";

export default function ResultPhase({ room, letter }: { room: GameRoomView; letter: string }) {
  const { answers } = room.state;
  const notAnswered = room.members.filter((m) => !answers.some((a) => a.userId === m.userId));

  return (
    <div className="space-y-4">
      <RoundHeader room={room} letter={letter} />

      {answers.length === 0 ? (
        <p className="text-chalk">Tidak ada yang menjawab di ronde ini.</p>
      ) : (
        <ol className="space-y-2">
          {answers.map((a) => (
            <li key={a.userId} className="flex items-center justify-between gap-3 rounded-md bg-board-deep px-3 py-2">
              <div className="min-w-0">
                <p className={`font-medium break-words ${a.accepted ? "text-chalk" : "text-chalk-dim line-through"}`}>
                  {a.text}
                </p>
                <p className="text-xs text-chalk-dim">
                  {a.name}
                  {a.rejectedBy.length > 0 && `. Ditolak oleh ${a.rejectedBy.map((r) => r.name).join(", ")}`}
                </p>
              </div>
              <p className={`shrink-0 text-sm font-medium ${a.accepted ? "text-chalk-yellow" : "text-chalk-dim"}`}>
                {a.accepted ? "Lolos +1" : "Gugur 0"}
              </p>
            </li>
          ))}
        </ol>
      )}

      {answers.length > 0 && notAnswered.length > 0 && (
        <p className="text-sm text-chalk-dim">Tidak menjawab: {notAnswered.map((m) => m.name).join(", ")}</p>
      )}
    </div>
  );
}
