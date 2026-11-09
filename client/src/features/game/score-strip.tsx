import { rankPlayers } from "@/shared/game";
import type { GameRoomView } from "@/stores/room-store";

/** Running score, visible throughout a game. */
export default function ScoreStrip({ room }: { room: GameRoomView }) {
  return (
    <ul aria-label="Skor sementara" className="flex flex-wrap gap-2 text-sm">
      {rankPlayers(room.members, room.state.scores).map((p) => (
        <li key={p.userId} className="flex items-center gap-2 rounded-full bg-board-deep px-3 py-1 text-chalk">
          <span className="max-w-40 truncate">{p.name}</span>
          <span className="font-medium text-chalk-yellow tabular-nums">{p.score}</span>
        </li>
      ))}
    </ul>
  );
}
