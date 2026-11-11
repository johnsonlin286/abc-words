import type { GameRoomView } from "@/stores/room-store";
import RoundHeader from "./round-header";
import { RejectedBy } from "./voting-phase";

function pointsLabel(accepted: boolean | null, points: number | null): string {
  const value = points ?? 0;
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${accepted ? "Lolos" : "Gugur"} ${sign}${Math.abs(value)}`;
}

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
            <li key={a.userId} className="rounded-md bg-board-deep px-3 py-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className={`font-medium break-words ${a.accepted ? "text-chalk" : "text-chalk-dim line-through"}`}>
                    {a.text}
                  </p>
                  <p className="text-xs text-chalk-dim">{a.name}</p>
                </div>
                <p className={`shrink-0 text-sm font-medium ${a.accepted ? "text-chalk-yellow" : "text-chalk-dim"}`}>
                  {pointsLabel(a.accepted, a.points)}
                </p>
              </div>
              <RejectedBy answer={a} />
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
