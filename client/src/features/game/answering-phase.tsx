"use client";

import { useEffect, useRef, useState } from "react";
import { buttonPrimary, input } from "@/components/ui";
import { ANSWER_MAX, validateAnswer } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore, type GameRoomView } from "@/stores/room-store";
import AnswerPills from "./answer-pills";
import Countdown, { useTimeLeft } from "./countdown";
import RoundHeader from "./round-header";

const NO_PASTE_MESSAGE = "Jawaban harus diketik sendiri.";

/**
 * Type one answer and send it (same as the app): the field is ready at once, and again after a
 * pause, because this phase is a race. Answers have to be typed, so paste and drop are refused.
 */
function AnswerForm({ letter, paused }: { letter: string; paused: boolean }) {
  const submitAnswer = useRoomStore((s) => s.submitAnswer);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!paused) inputRef.current?.focus();
  }, [paused]);
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
          ref={inputRef}
          aria-label={`Jawaban berawalan huruf ${letter}`}
          className={`${input} min-w-0 flex-1 text-lg`}
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
        />
        <button
          type="submit"
          disabled={sending || blocked || !text.trim()}
          className={buttonPrimary}
        >
          {blocked ? `Tunggu ${Math.ceil(blockedMs / 1000)}` : "Kirim"}
        </button>
      </div>
      {blocked && (
        <p role="status" className="rounded-xl border-2 border-dashed border-redpen bg-white px-3.5 py-2.5 text-sm font-semibold text-redpen">
          Terlalu banyak jawaban ditolak. Tunggu {Math.ceil(blockedMs / 1000)} detik sebelum mengirim lagi.
        </p>
      )}
      {alert && (
        <p role="alert" className="text-sm font-semibold text-redpen">
          {alert}
        </p>
      )}
    </form>
  );
}

/** Letter, time and the answer field close together, then the words already used (same as the app). */
export default function AnsweringPhase({ room, letter }: { room: GameRoomView; letter: string }) {
  const myId = useAuthStore((s) => s.user?.userId);
  const endsAt = useRoomStore((s) => s.phaseEndsAt);
  const mine = room.state.answers.find((a) => a.userId === myId);

  return (
    <div className="space-y-3">
      <RoundHeader room={room} letter={letter} />
      {endsAt !== null && room.state.phaseMs !== null && <Countdown endsAt={endsAt} totalMs={room.state.phaseMs} />}

      {mine ? (
        <p role="status" className="rounded-xl border-2 border-ink bg-highlight-soft px-3.5 py-2.5 font-medium">
          Jawabanmu: <span className="text-lg font-bold break-words">{mine.text}</span>. Menunggu pemain lain.
        </p>
      ) : (
        <AnswerForm letter={letter} paused={room.state.paused} />
      )}

      <AnswerPills room={room} />
    </div>
  );
}
