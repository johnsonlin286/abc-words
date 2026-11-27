"use client";

import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import { AfkNotice, isAfk } from "./afk";
import AlphabetStrip from "./alphabet-strip";
import AnsweringPhase from "./answering-phase";
import ChatDock from "./chat-dock";
import ChatPanel from "./chat-panel";
import ConnectionNotice from "./connection-notice";
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
import { useFocusGameArea } from "./use-focus-game-area";
import { useAnswersBelow } from "./use-answers-below";
import VotingFooter, { VOTING_FOOTER_HEIGHT } from "./voting-footer";

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
  const phase = room?.state.phase;
  // The "waiting for players" note sits at the top of the card, so it is brought into view as well.
  const waitingForPlayers = !!room && room.state.waitingForPlayersMs !== null;
  const { areaRef, showInArea } = useFocusGameArea(
    !room || phase === "waiting" ? null : `${room.state.round}:${phase}:${waitingForPlayers}`,
    !wide,
  );

  const voting = phase === "voting" && !!room;
  // On phones the footer is pinned to the bottom of the screen; on wider screens it sits under the list.
  const answersBelow = useAnswersBelow(voting ? String(room.state.round) : null, wide ? 0 : VOTING_FOOTER_HEIGHT);

  if (!room || !myId) return null;

  const { reveal, usedLetters, round } = room.state;
  // The new letter is crossed out only after its reveal, so the strip can't spoil it.
  const crossedOut = phase === "reveal" && reveal ? usedLetters.filter((letter) => letter !== reveal.letter) : usedLetters;
  const playing = phase !== "waiting" && phase !== "finished";

  return (
    // On phones the chat is a floating button, so leave room below the game for it.
    // While voting the pinned footer and the chat button above it take more room.
    <div className={`flex w-full flex-col gap-6 ${wide ? "" : phase === "voting" ? "pb-44" : "pb-20"}`}>
      <RoomBar room={room} canEnd={playing && room.hostId === myId} playing={playing} />
      <ConnectionNotice />
      <PingAlert isReady={phase !== "waiting" || room.state.ready.includes(myId)} />
      {/* Only while playing, as in the app: the waiting room has no letters yet. */}
      {playing && <AlphabetStrip used={crossedOut} />}

      {/*
        The game area each new phase scrolls to on phones. During a game it is at least a screen tall,
        so even a short phase can reach the top.
      */}
      <div ref={areaRef} className={`flex flex-col gap-6 ${playing && !wide ? "min-h-dvh" : ""}`}>
      {playing && <ScoreStrip room={room} />}

      <section aria-label="Permainan" className="note-card flex flex-col gap-6 p-4 sm:p-6">
        {playing && <WaitingForPlayers />}
        {playing && isAfk(room.state, myId) && <AfkNotice />}
        {/* A paused game can be seen but not played. */}
        <div inert={room.state.paused} className={`flex flex-col gap-6 ${room.state.paused ? "opacity-50" : ""}`}>
          {phase === "waiting" && <WaitingRoom room={room} myId={myId} />}
          {phase === "picking" && <PickingPhase room={room} />}
          {phase === "reveal" && reveal && (
            <RevealPhase key={round} room={room} reveal={reveal} onVoteShown={waitingForPlayers ? undefined : showInArea} />
          )}
          {phase === "answering" && reveal && <AnsweringPhase key={round} room={room} letter={reveal.letter} />}
          {phase === "voting" && reveal && (
            <>
              <VotingPhase key={round} room={room} letter={reveal.letter} listRef={answersBelow.listRef} />
              <VotingFooter
                key={`footer-${round}`}
                room={room}
                myId={myId}
                below={answersBelow.below}
                onShowMore={answersBelow.showMore}
                fixed={!wide}
              />
            </>
          )}
          {phase === "result" && reveal && <ResultPhase room={room} letter={reveal.letter} />}
          {phase === "finished" && <FinishedPhase room={room} isHost={room.hostId === myId} />}
        </div>
      </section>
      </div>

      {/* One chat at a time: the inline card on wider screens, the floating dock on phones. */}
      {wide ? <ChatPanel /> : <ChatDock raised={voting ? VOTING_FOOTER_HEIGHT : 0} />}
    </div>
  );
}
