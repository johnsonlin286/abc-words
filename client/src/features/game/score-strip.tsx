import { rankPlayers } from "@/shared/game";
import type { GameRoomView } from "@/stores/room-store";
import { AfkBadge, isAfk } from "./afk";
import WarningBadge from "./warning-badge";

/** Running score, visible throughout a game, with a warning for repeated lone rejections. */
export default function ScoreStrip({ room }: { room: GameRoomView }) {
  return (
    <ul aria-label="Skor sementara" className="flex flex-wrap gap-2 text-sm">
      {rankPlayers(room.members, room.state.scores).map((p) => (
        <li key={p.userId} className="flex items-center gap-2 rounded-full bg-board-deep px-3 py-1 text-chalk">
          <span className="max-w-40 truncate">{p.name}</span>
          <WarningBadge count={room.state.loneRejections[p.userId] ?? 0} name={p.name} />
          {isAfk(room.state, p.userId) && <AfkBadge name={p.name} />}
          <span className="font-medium text-chalk-yellow tabular-nums">{p.score}</span>
        </li>
      ))}
    </ul>
  );
}
