"use client";

import { ArrowDown } from "lucide-react";
import { useState } from "react";
import { buttonPrimary, buttonSecondary } from "@/components/ui";
import { isJudgeable } from "@/shared/game";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import { isAfk } from "./afk";

/** Height of the footer on phones; the chat button floats above it. */
export const VOTING_FOOTER_HEIGHT = 80;

/** Same rule as the server: online, with someone else's answer to judge (not verified, not auto-failed). */
function canJudge({ members, state }: GameRoomView, userId: string): boolean {
  return (
    members.some((m) => m.userId === userId && m.isConnected) &&
    state.answers.some((a) => a.userId !== userId && isJudgeable(a))
  );
}

/**
 * How many are done, and the button that says this player is (same as the app). Until every answer
 * has been on screen it reads "Lihat N Lagi" and scrolls on instead, so nobody finishes judging
 * without seeing them all. `fixed` pins it to the bottom of a phone screen.
 */
export default function VotingFooter({
  room,
  myId,
  below,
  onShowMore,
  fixed,
}: {
  room: GameRoomView;
  myId: string;
  /** Answers this player hasn't had on screen yet this round. */
  below: number;
  onShowMore: () => void;
  fixed: boolean;
}) {
  const setVotingDone = useRoomStore((s) => s.setVotingDone);
  const [error, setError] = useState<string | null>(null);
  const { votingDone, paused } = room.state;
  // AFK players may judge, but voting doesn't wait for them, so they aren't counted.
  const judges = room.members.filter((m) => !isAfk(room.state, m.userId) && canJudge(room, m.userId));
  const isJudge = canJudge(room, myId);
  const iAmDone = votingDone.includes(myId);
  const doneCount = judges.filter((m) => votingDone.includes(m.userId)).length;

  const toggle = async () => setError(await setVotingDone(!iAmDone));

  return (
    <div
      className={`flex items-center gap-3 ${
        fixed ? "fixed inset-x-0 bottom-0 z-20 border-t-2 border-ink bg-paper px-4 pb-[env(safe-area-inset-bottom)]" : ""
      }`}
      style={fixed ? { minHeight: VOTING_FOOTER_HEIGHT } : undefined}
    >
      <p
        aria-live="polite"
        className={`min-w-0 flex-1 text-sm ${error ? "font-semibold text-redpen" : "font-medium text-ink-soft"}`}
      >
        {paused
          ? "Permainan dijeda."
          : (error ?? (isJudge ? `${doneCount}/${judges.length} selesai` : "Menunggu pemain lain menilai jawabanmu."))}
      </p>
      {!isJudge ? null : !iAmDone && below > 0 ? (
        <button type="button" onClick={onShowMore} aria-label={`Lihat ${below} jawaban lagi di bawah`} className={buttonPrimary}>
          Lihat {below} Lagi
          <ArrowDown aria-hidden className="size-5" strokeWidth={2.75} />
        </button>
      ) : iAmDone ? (
        <button type="button" onClick={() => void toggle()} disabled={paused} className={buttonSecondary}>
          Belum Selesai
        </button>
      ) : (
        <button type="button" onClick={() => void toggle()} disabled={paused} className={buttonPrimary}>
          Selesai Menilai
        </button>
      )}
    </div>
  );
}
