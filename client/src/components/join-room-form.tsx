"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getRoomSummary } from "@/lib/api";
import { LIMITS } from "@/shared/game";
import { useRoomStore } from "@/stores/room-store";
import { getRoomStatus, RoomStatusLabel, VisibilityBadge } from "./room-list";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {!codeLocked && (
        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Kode room <span className="text-red-500">*</span>
          </span>
          <input
            autoFocus
            className={`${inputClass} font-mono text-lg tracking-[0.3em] uppercase`}
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            maxLength={LIMITS.roomCode}
            placeholder="ABC123"
            autoComplete="off"
            required
          />
        </label>
      )}

      {/* Room preview */}
      {codeComplete && (
        <div className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800">
          {preview.isFetching && !room && <p className="text-zinc-500">Mencari room…</p>}
          {preview.isError && <p className="text-red-600">{preview.error.message}</p>}
          {room && (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                {codeLocked && (
                  <p className="font-mono font-semibold tracking-widest">{room.id}</p>
                )}
                <p className="truncate">
                  Host: <span className="font-medium">{room.hostName ?? "—"}</span>
                </p>
                <p className="text-xs text-zinc-500">
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
            <button
              type="button"
              onClick={onUnlockCode}
              className="mt-1 text-xs text-blue-600 hover:underline"
            >
              Pakai kode lain
            </button>
          )}
        </div>
      )}

      {needsPassword && joinable && (
        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Kata sandi <span className="text-red-500">*</span>
          </span>
          <input
            ref={passwordRef}
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={LIMITS.passwordMax}
            required
          />
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending || !joinable}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Bergabung…" : "Gabung room"}
      </button>
    </form>
  );
}
