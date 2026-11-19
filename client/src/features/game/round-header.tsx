import { categoryLabel } from "@/shared/game";
import type { GameRoomView } from "@/stores/room-store";

/** "Ronde 2 dari 10" and the category, shared by every phase of a round. */
export function RoundTitle({ room }: { room: GameRoomView }) {
  return (
    <div className="min-w-0">
      <h2 className="text-2xl leading-tight font-bold sm:text-3xl">
        Ronde {room.state.round} <span className="text-ink-faint">dari {room.settings.maxRounds}</span>
      </h2>
      {/* A step below the round title: the category is what everyone needs to remember this round. */}
      <p className="mt-1 text-lg font-medium break-words text-ink-soft sm:text-xl">
        Kategori: <span className="rounded-sm bg-highlight-soft px-1.5 font-bold text-ink">{categoryLabel(room.settings)}</span>
      </p>
    </div>
  );
}

/** The round's letter in red pen, next to the round title. */
export default function RoundHeader({ room, letter }: { room: GameRoomView; letter: string }) {
  return (
    <div className="flex items-center gap-4">
      {/*
        The red letter with a small "Huruf" label, centred in a fixed-width block: without the old
        circle a lone I read as a red bar, and narrow letters hugged the left edge.
      */}
      <p aria-label={`Huruf ronde ini: ${letter}`} className="flex w-16 shrink-0 flex-col items-center">
        <span aria-hidden className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          Huruf
        </span>
        <span aria-hidden className="text-6xl leading-none font-bold text-redpen">
          {letter}
        </span>
      </p>
      <RoundTitle room={room} />
    </div>
  );
}
