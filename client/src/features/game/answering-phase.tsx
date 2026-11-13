"use client";

import { useState } from "react";
import { ANSWER_MAX, validateAnswer } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import AnswerBoard from "./answer-board";
import Countdown, { useTimeLeft } from "./countdown";
import RoundHeader from "./round-header";

const NO_PASTE_MESSAGE = "Jawaban harus diketik sendiri.";

function AnswerForm({ letter }: { letter: string }) {
  const submitAnswer = useRoomStore((s) => s.submitAnswer);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);
  /** Local time until which the server refuses answers after too many rejected tries. */
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const blockedMs = useTimeLeft(blockedUntil) ?? 0;
  const blocked = blockedMs > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || blocked) return;
    const invalid = validateAnswer(text, letter);
    if (invalid) return setAlert(invalid);

    setSending(true);
    const result = await submitAnswer(text);
    setSending(false);

    if (result.status === "accepted") return;
    // The pause gets its own line below; the alert still says what was wrong with this answer.
    if (result.retryAfterMs) setBlockedUntil(Date.now() + result.retryAfterMs);
    setAlert(result.message);
    if (result.status !== "error") setText("");
  };

  const refuse = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setAlert(NO_PASTE_MESSAGE);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          aria-label={`Jawaban berawalan huruf ${letter}`}
          className="min-w-0 flex-1 rounded-md border border-chalk-dim/50 bg-board-deep px-3 py-2 text-lg text-chalk placeholder:text-chalk-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setAlert(null);
          }}
          onPaste={refuse}
          onDrop={refuse}
          maxLength={ANSWER_MAX}
          placeholder={`Berawalan ${letter}…`}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
        <button
          type="submit"
          disabled={sending || blocked || !text.trim()}
          className="rounded-md bg-chalk-yellow px-5 py-2 font-medium text-board-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk disabled:opacity-50"
        >
          {blocked ? `Tunggu ${Math.ceil(blockedMs / 1000)}` : "Kirim"}
        </button>
      </div>
      {blocked && (
        <p role="status" className="rounded-md border border-chalk-pink/60 px-3 py-2 text-sm text-chalk">
          Terlalu banyak jawaban ditolak. Tunggu {Math.ceil(blockedMs / 1000)} detik sebelum mengirim lagi.
        </p>
      )}
      {alert && (
        <p role="alert" className="rounded-md border border-chalk-yellow px-3 py-2 text-sm text-chalk">
          {alert}
        </p>
      )}
    </form>
  );
}

export default function AnsweringPhase({ room, letter }: { room: GameRoomView; letter: string }) {
  const myId = useAuthStore((s) => s.user?.userId);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const mine = room.state.answers.find((a) => a.userId === myId);

  return (
    <div className="space-y-4">
      <RoundHeader room={room} letter={letter} />
      {endsAt !== null && room.state.phaseMs !== null && <Countdown endsAt={endsAt} totalMs={room.state.phaseMs} />}

      {mine ? (
        <p className="text-chalk">
          Jawabanmu: <span className="font-medium break-words">{mine.text}</span>. Menunggu pemain lain.
        </p>
      ) : (
        <AnswerForm letter={letter} />
      )}

      <AnswerBoard room={room} />
    </div>
  );
}
