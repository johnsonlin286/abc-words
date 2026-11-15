import PenCircle from "@/components/pen-circle";
import { categoryLabel } from "@/shared/game";
import type { GameRoomView } from "@/stores/room-store";

/** "Ronde 2 dari 10" and the category, shared by every phase of a round. */
export function RoundTitle({ room }: { room: GameRoomView }) {
  return (
    <div className="min-w-0">
      <h2 className="text-2xl leading-tight font-bold sm:text-3xl">
        Ronde {room.state.round} <span className="text-ink-faint">dari {room.settings.maxRounds}</span>
      </h2>
      <p className="mt-1 text-sm font-medium break-words text-ink-soft">
        Kategori: <span className="rounded-sm bg-highlight-soft px-1 font-semibold text-ink">{categoryLabel(room.settings)}</span>
      </p>
    </div>
  );
}

/** The round's letter, circled in red pen, next to the round title. */
export default function RoundHeader({ room, letter }: { room: GameRoomView; letter: string }) {
  return (
    <div className="flex items-center gap-6">
      <p
        aria-label={`Huruf ronde ini: ${letter}`}
        className="relative ml-2 shrink-0 px-1.5 text-6xl leading-none font-bold text-redpen"
      >
        {letter}
        <PenCircle />
      </p>
      <RoundTitle room={room} />
    </div>
  );
}
