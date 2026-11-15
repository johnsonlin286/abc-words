import { categoryLabel } from "@/shared/game";
import type { GameRoomView } from "@/stores/room-store";
import { chalkFont } from "./fonts";

/** The round's letter and what kind of answer it needs. */
export default function RoundHeader({ room, letter }: { room: GameRoomView; letter: string }) {
  return (
    <div className="flex items-center gap-5">
      <p aria-label={`Huruf ronde ini: ${letter}`} className={`${chalkFont.className} text-7xl leading-none text-chalk-yellow`}>
        {letter}
      </p>
      <div className="min-w-0">
        <h2 className={`${chalkFont.className} text-3xl text-chalk`}>
          Ronde {room.state.round} dari {room.settings.maxRounds}
        </h2>
        <p className="text-sm break-words text-chalk-dim">
          Kategori: {categoryLabel(room.settings)}.
        </p>
      </div>
    </div>
  );
}
