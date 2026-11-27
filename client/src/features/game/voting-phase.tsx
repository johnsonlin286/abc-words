"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import {
  LONE_REJECTION_WARNINGS,
  POINTS,
  REJECT_REASONS,
  formatPoints,
  rejectReasonLabel,
  type GameState,
  type RejectReason,
} from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import Countdown from "./countdown";
import InfoBadge from "./info-badge";
import RoundHeader from "./round-header";
import VerifiedBadge from "./verified-badge";
import { WarningIcon, warningText } from "./warning-badge";

type Answer = GameState["answers"][number];

/** The rules of judging, behind the info button so the answers get the room (same as the app). */
function rulesText(oneJudge: boolean, anyVerified: boolean): string {
  const rejecting = oneJudge
    ? "Kalian main berdua: jawaban yang kamu tolak langsung gugur, tapi tanpa pengurangan poin. Jatah tolak tidak dikembalikan."
    : `Jawaban yang gugur ${formatPoints(POINTS.rejected)} poin. Tolakan yang disetujui pemain lain dikembalikan ke jatahmu. Menolak sendirian jawaban yang tetap lolos, mulai kali ke-${LONE_REJECTION_WARNINGS + 1}: ${formatPoints(POINTS.loneRejection)} poin.`;
  const verified = "Jawaban Terverifikasi ada di daftar kategori ini, jadi langsung lolos dan tidak bisa ditolak.";
  return anyVerified ? `${rejecting} ${verified}` : rejecting;
}

/** "Salah ejaan" on a button: every word capitalized. */
function buttonLabel(label: string): string {
  return label.replace(/\b\w/g, (first) => first.toUpperCase());
}

/**
 * All answers in one compact list (same as the app): reject with a reason under the answer, votes
 * public. The button that ends this player's judging is in `VotingFooter`, which stays on screen.
 */
export default function VotingPhase({
  room,
  letter,
  listRef,
}: {
  room: GameRoomView;
  letter: string;
  /** The answer list, so the footer can tell which answers are still below the screen. */
  listRef?: React.Ref<HTMLOListElement>;
}) {
  const myId = useAuthStore((s) => s.user?.userId);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  /** Answer whose reasons are open before a rejection is sent. */
  const [choosingFor, setChoosingFor] = useState<string | null>(null);

  const { answers, rejectionsLeft, phaseMs } = room.state;
  const anyVerified = answers.some((a) => a.verified);
  const myLoneRejections = (myId && room.state.loneRejections[myId]) || 0;
  // Same rule as the server: with two players online, each answer has one judge.
  const oneJudge = room.members.filter((m) => m.isConnected).length === 2;

  return (
    <div className="space-y-3">
      <RoundHeader room={room} letter={letter} />
      {endsAt !== null && phaseMs !== null && <Countdown endsAt={endsAt} totalMs={phaseMs} />}

      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <h3 className="text-lg font-bold whitespace-nowrap">Coret yang salah!</h3>
          <InfoBadge label="Aturan menilai" explanation={rulesText(oneJudge, anyVerified)}>
            <Info aria-hidden className="size-5 text-ink-soft" strokeWidth={2.5} />
          </InfoBadge>
        </div>
        <p className="shrink-0 text-sm font-medium text-ink-soft">
          Jatah tolak: <span className="rounded-sm bg-highlight px-1 font-bold text-ink tabular-nums">{rejectionsLeft}</span>
        </p>
      </div>

      {oneJudge && <p className="text-sm font-medium text-ink-soft">Main berdua: tolakanmu langsung menggugurkan.</p>}
      {myLoneRejections >= LONE_REJECTION_WARNINGS && (
        <p className="flex items-start gap-1.5 text-sm font-semibold text-redpen">
          <WarningIcon className="mt-0.5 shrink-0" />
          {warningText(myLoneRejections, null)}
        </p>
      )}

      <ol ref={listRef} className="flex flex-col gap-2">
        {answers.map((a) => (
          <AnswerRow
            key={a.userId}
            answer={a}
            myId={myId}
            choosing={choosingFor === a.userId}
            noRejectionsLeft={rejectionsLeft === 0}
            onChoose={(open) => setChoosingFor(open ? a.userId : null)}
          />
        ))}
      </ol>
    </div>
  );
}

function AnswerRow({
  answer,
  myId,
  choosing,
  noRejectionsLeft,
  onChoose,
}: {
  answer: Answer;
  myId: string | undefined;
  choosing: boolean;
  noRejectionsLeft: boolean;
  onChoose: (open: boolean) => void;
}) {
  const setRejection = useRoomStore((s) => s.setRejection);
  const [error, setError] = useState<string | null>(null);
  const isMine = answer.userId === myId;
  const mine = answer.rejectedBy.find((r) => r.userId === myId);
  const showReasons = !isMine && !answer.verified && (mine !== undefined || choosing);

  const send = async (reason: RejectReason | null) => {
    onChoose(false);
    setError(await setRejection(answer.userId, reason));
  };

  const label = mine ? "Batal Tolak" : choosing ? "Batal" : "Tolak";
  const disabled = mine === undefined && noRejectionsLeft;

  return (
    <li
      className={`space-y-1.5 rounded-xl border-2 bg-white px-3 py-2 ${
        answer.rejectedBy.length > 0 ? "border-redpen" : "border-ink/20"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg leading-6 font-bold break-words">{answer.text}</p>
          <p className="truncate text-sm font-medium text-ink-soft">{isMine ? "Jawabanmu" : answer.name}</p>
        </div>
        {answer.verified ? (
          <VerifiedBadge />
        ) : isMine ? null : (
          <button
            type="button"
            aria-expanded={showReasons}
            aria-label={`${label} ${answer.text}`}
            disabled={disabled}
            onClick={() => (mine ? void send(null) : onChoose(!choosing))}
            className={`shrink-0 rounded-xl border-2 bg-white px-3.5 py-2 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen disabled:cursor-not-allowed disabled:border-ink/20 disabled:text-ink-faint ${
              mine ? "border-ink text-ink hover:bg-highlight-soft" : "border-redpen text-redpen hover:bg-highlight-soft"
            }`}
          >
            {label}
          </button>
        )}
      </div>

      {showReasons && (
        <fieldset className="space-y-1">
          <legend className="sr-only">Alasan menolak {answer.text}</legend>
          <div className="flex flex-wrap gap-1.5">
            {REJECT_REASONS.map((r) => {
              const selected = mine?.reason === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`Tolak ${answer.text}: ${r.label}`}
                  onClick={() => !selected && void send(r.id)}
                  className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen ${
                    selected ? "border-redpen bg-redpen text-white" : "border-ink/30 bg-white text-ink hover:bg-highlight-soft"
                  }`}
                >
                  {buttonLabel(r.label)}
                </button>
              );
            })}
          </div>
          {!mine && <p className="text-xs font-medium text-ink-soft">Pilih alasan untuk menolak.</p>}
        </fieldset>
      )}

      <RejectedBy answer={answer} />
      {error && (
        <p role="alert" className="text-sm font-semibold text-redpen">
          {error}
        </p>
      )}
    </li>
  );
}

/**
 * Public votes: who rejected the answer, and why, in the teacher's red pen. One line per reason
 * (same as the app), so eight players don't push the other answers off the screen.
 */
export function RejectedBy({ answer }: { answer: Answer }) {
  if (answer.rejectedBy.length === 0) return null;
  const names = new Map<RejectReason, string[]>();
  for (const r of answer.rejectedBy) names.set(r.reason, [...(names.get(r.reason) ?? []), r.name]);
  return (
    <ul className="font-hand text-base leading-snug text-redpen">
      {[...names].map(([reason, rejecters]) => (
        <li key={reason}>
          Ditolak {rejecters.join(", ")}: {rejectReasonLabel(reason)}
        </li>
      ))}
    </ul>
  );
}
