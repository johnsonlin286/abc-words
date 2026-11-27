"use client";

import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import { AfkNotice, isAfk } from "./afk";
import AlphabetStrip from "./alphabet-strip";
import AnsweringPhase from "./answering-phase";
import ChatDock from "./chat-dock";
import ChatPanel from "./chat-panel";
import FinishedPhase from "./finished-phase";
import PickingPhase from "./picking-phase";
import PingAlert from "./ping-alert";
import RevealPhase from "./reveal-phase";
import ResultPhase from "./result-phase";
import RoomBar from "./room-bar";
import ScoreStrip from "./score-strip";
import VotingPhase from "./voting-phase";
import WaitingForPlayers from "./waiting-for-players";
import WaitingRoom from "./waiting-room";

/**
 * The room page, written on the notebook: room code and letters on the paper, the current
 * phase on one index card, the chat on another.
 */
const WIDE = "(min-width: 640px)"; // Tailwind's sm

/** True on screens of at least `sm`; false on the server and on phones. */
function useWideScreen(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(WIDE);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(WIDE).matches,
    () => false,
  );
}

export default function GameScreen() {
  const room = useRoomStore((s) => s.room);
  const myId = useAuthStore((s) => s.user?.userId);
  const wide = useWideScreen();

  if (!room || !myId) return null;

  const { phase, reveal, usedLetters, round } = room.state;
  // The new letter is crossed out only after its reveal, so the strip can't spoil it.
  const crossedOut = phase === "reveal" && reveal ? usedLetters.filter((letter) => letter !== reveal.letter) : usedLetters;
  const playing = phase !== "waiting" && phase !== "finished";

  return (
    // On phones the chat is a floating button, so leave room below the game for it.
    <div className={`flex w-full flex-col gap-6 ${wide ? "" : "pb-20"}`}>
      <RoomBar room={room} canEnd={playing && room.hostId === myId} />
      <PingAlert isReady={phase !== "waiting" || room.state.ready.includes(myId)} />
      <AlphabetStrip used={crossedOut} />
      {playing && <ScoreStrip room={room} />}

      <section aria-label="Permainan" className="note-card flex flex-col gap-6 p-4 sm:p-6">
        {playing && <WaitingForPlayers />}
        {playing && isAfk(room.state, myId) && <AfkNotice />}
        {/* A paused game can be seen but not played. */}
        <div inert={room.state.paused} className={`flex flex-col gap-6 ${room.state.paused ? "opacity-50" : ""}`}>
          {phase === "waiting" && <WaitingRoom room={room} myId={myId} />}
          {phase === "picking" && <PickingPhase room={room} />}
          {phase === "reveal" && reveal && <RevealPhase key={round} room={room} reveal={reveal} />}
          {phase === "answering" && reveal && <AnsweringPhase key={round} room={room} letter={reveal.letter} />}
          {phase === "voting" && reveal && <VotingPhase key={round} room={room} letter={reveal.letter} />}
          {phase === "result" && reveal && <ResultPhase room={room} letter={reveal.letter} />}
          {phase === "finished" && <FinishedPhase room={room} isHost={room.hostId === myId} />}
        </div>
      </section>

      {/* One chat at a time: the inline card on wider screens, the floating dock on phones. */}
      {wide ? <ChatPanel /> : <ChatDock />}
    </div>
  );
}
