"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getRoomSummary } from "@/lib/api";
import { buttonPrimary, errorText, input, label, linkButton } from "@/components/ui";
import { LIMITS } from "@/shared/game";
import { useRoomStore } from "@/stores/room-store";
import { getRoomStatus, RoomStatusLabel, VisibilityBadge } from "./room-list";

type Props = {
  code: string;
  onCodeChange: (value: string) => void;
  /** Room was picked from the list: hide the code input, show only the room card. */
  codeLocked: boolean;
  /** Offers a way to type another code; only used when `codeLocked`. */
  onUnlockCode?: () => void;
  /** Changes every time a room is picked from the list, to move focus. */
  selectionId: number;
};

export default function JoinRoomForm({
  code,
  onCodeChange,
  codeLocked,
  onUnlockCode,
  selectionId,
}: Props) {
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const pending = useRoomStore((s) => s.pending);
  const serverError = useRoomStore((s) => s.error);

  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const codeComplete = code.length === LIMITS.roomCode;

  // Look the room up as soon as a full code is present, to know if it needs a password.
  const preview = useQuery({
    queryKey: ["room-peek", code],
    queryFn: () => getRoomSummary(code),
    enabled: codeComplete,
    retry: false,
    staleTime: 0,
  });

  const room = preview.data;
  const joinable = room ? getRoomStatus(room).joinable : false;
  const needsPassword = room?.hasPassword ?? false;

  // After picking a private room from the list, jump to the password field
  // as soon as it appears.
  useEffect(() => {
    if (selectionId > 0 && needsPassword) passwordRef.current?.focus();
  }, [selectionId, needsPassword]);

  const handleCodeChange = (value: string) => {
    onCodeChange(value.replace(/[^a-z0-9]/gi, "").toUpperCase());
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return setLocalError("Masukkan kode room yang valid.");
    if (needsPassword && !password) return setLocalError("Kata sandi wajib diisi.");
    setLocalError(null);
    const ok = await joinRoom({
      roomId: room.id,
      password: needsPassword ? password : undefined,
    });
    if (!ok) preview.refetch(); // member count may have changed
  };

  const error = localError ?? serverError;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!codeLocked && (
        <div className="space-y-1.5">
          <label htmlFor="join-code" className={label}>
            Kode room
          </label>
          <input
            id="join-code"
            autoFocus
            className={`${input} text-xl font-bold tracking-[0.3em] uppercase tabular-nums`}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            maxLength={LIMITS.roomCode}
            placeholder="ABC123"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
          />
        </div>
      )}

      {/* Room preview */}
      {codeComplete && (
        <div className="rounded-xl border-2 border-dashed border-ink/40 bg-paper px-3.5 py-2.5">
          {preview.isFetching && !room && <p className="text-ink-soft">Mencari room…</p>}
          {preview.isError && <p className={errorText}>{preview.error.message}</p>}
          {room && (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                {codeLocked && <p className="text-xl font-bold tracking-[0.2em] tabular-nums">{room.id}</p>}
                <p className="truncate">
                  Host: <span className="font-bold">{room.hostName ?? "—"}</span>
                </p>
                <p className="text-sm text-ink-soft">
                  {room.memberCount}/{room.maxMembers} pemain
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <VisibilityBadge isPrivate={room.hasPassword} />
                <RoomStatusLabel room={room} />
              </div>
            </div>
          )}
          {codeLocked && onUnlockCode && (
            <button type="button" onClick={onUnlockCode} className={`${linkButton} mt-2 text-sm`}>
              Pakai kode lain
            </button>
          )}
        </div>
      )}

      {needsPassword && joinable && (
        <div className="space-y-1.5">
          <label htmlFor="join-password" className={label}>
            Kata sandi room
          </label>
          <input
            id="join-password"
            ref={passwordRef}
            type="password"
            className={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={LIMITS.passwordMax}
            required
          />
        </div>
      )}

      {error && <p className={errorText}>{error}</p>}

      <button type="submit" disabled={pending || !joinable} className={buttonPrimary}>
        {pending ? "Bergabung…" : "Gabung room"}
      </button>
    </form>
  );
}
