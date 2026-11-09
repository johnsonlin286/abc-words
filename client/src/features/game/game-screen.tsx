"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import AlphabetStrip from "./alphabet-strip";
import AnsweringPhase from "./answering-phase";
import ChatPanel from "./chat-panel";
import FinishedPhase from "./finished-phase";
import PickingPhase from "./picking-phase";
import RevealPhase from "./reveal-phase";
import ResultPhase from "./result-phase";
import RoomBar from "./room-bar";
import ScoreStrip from "./score-strip";
import VotingPhase from "./voting-phase";
import WaitingRoom from "./waiting-room";

function EndGameButton() {
  const endGame = useRoomStore((s) => s.endGame);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="rounded-md border border-chalk-dim/50 px-4 py-2 text-sm text-chalk hover:border-chalk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow"
        onClick={async () => setError(await endGame())}
      >
        Akhiri permainan
      </button>
      {error && <p className="text-sm text-chalk-yellow">{error}</p>}
    </div>
  );
}

/** The room page: the chalkboard shows the current game phase, the chat stays below it. */
export default function GameScreen() {
  const room = useRoomStore((s) => s.room);
  const myId = useAuthStore((s) => s.user?.userId);

  if (!room || !myId) return null;

  const { phase, reveal, usedLetters, round } = room.state;
  // The new letter is crossed out only after its reveal, so the strip can't spoil it.
  const crossedOut = phase === "reveal" && reveal ? usedLetters.filter((letter) => letter !== reveal.letter) : usedLetters;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800">
      <section className="space-y-6 bg-board p-5 sm:p-7">
        <RoomBar room={room} />
        <AlphabetStrip used={crossedOut} />
        {phase === "waiting" && <WaitingRoom room={room} myId={myId} />}
        {phase === "picking" && <PickingPhase room={room} />}
        {phase === "reveal" && reveal && <RevealPhase key={round} room={room} reveal={reveal} />}
        {phase === "answering" && reveal && <AnsweringPhase key={round} room={room} letter={reveal.letter} />}
        {phase === "voting" && reveal && <VotingPhase key={round} room={room} letter={reveal.letter} />}
        {phase === "result" && reveal && <ResultPhase room={room} letter={reveal.letter} />}
        {phase === "finished" && <FinishedPhase room={room} isHost={room.hostId === myId} />}
        {phase !== "waiting" && phase !== "finished" && (
          <>
            <ScoreStrip room={room} />
            {room.hostId === myId && <EndGameButton />}
          </>
        )}
      </section>
      <ChatPanel />
    </div>
  );
}
