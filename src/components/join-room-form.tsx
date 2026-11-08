"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { LIMITS } from "@/shared/socket-events";
import { peekRoom, useRoomStore } from "@/stores/room-store";
import { VisibilityBadge } from "./room-list";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700";

type Props = {
  userName: string;
  onUserNameChange: (value: string) => void;
  code: string;
  onCodeChange: (value: string) => void;
  /** Room was picked from the list: hide the code input, show only the room card. */
  codeLocked: boolean;
  onUnlockCode: () => void;
  /** Changes every time a room is picked from the list, to move focus. */
  selectionId: number;
};

export default function JoinRoomForm({
  userName,
  onUserNameChange: setUserName,
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
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const codeComplete = code.length === LIMITS.roomCode;

  // Look the room up as soon as a full code is present, to know if it needs a password.
  const preview = useQuery({
    queryKey: ["room-peek", code],
    queryFn: () => peekRoom(code),
    enabled: codeComplete,
    retry: false,
    staleTime: 0,
  });

  const room = preview.data;
  const isFull = room ? room.memberCount >= room.maxMembers : false;

  // After picking a room from the list, focus the first field still empty.
  useEffect(() => {
    if (selectionId === 0) return;
    if (!userName.trim()) nameRef.current?.focus();
    else passwordRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on new selection
  }, [selectionId]);

  const handleCodeChange = (value: string) => {
    onCodeChange(value.replace(/[^a-z0-9]/gi, "").toUpperCase());
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = userName.trim();
    if (!name) return setLocalError("Nama wajib diisi.");
    if (!room) return setLocalError("Masukkan kode room yang valid.");
    if (room.isPrivate && !password) return setLocalError("Kata sandi wajib diisi.");
    setLocalError(null);
    const ok = await joinRoom({
      roomId: room.id,
      userName: name,
      password: room.isPrivate ? password : undefined,
    });
    if (!ok) preview.refetch(); // member count may have changed
  };

  const error = localError ?? serverError;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block space-y-1">
        <span className="text-sm font-medium">
          Nama <span className="text-red-500">*</span>
        </span>
        <input
          ref={nameRef}
          className={inputClass}
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          maxLength={LIMITS.userName}
          placeholder="mis. Sari"
          autoFocus={!codeLocked}
          required
        />
      </label>

      {!codeLocked && (
        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Kode room <span className="text-red-500">*</span>
          </span>
          <input
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
                  Host: <span className="font-medium">{room.hostName}</span>
                </p>
                <p className={`text-xs ${isFull ? "text-red-600" : "text-zinc-500"}`}>
                  {room.memberCount}/{room.maxMembers} pemain{isFull && " — penuh"}
                </p>
              </div>
              <VisibilityBadge isPrivate={room.isPrivate} />
            </div>
          )}
          {codeLocked && (
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

      {room?.isPrivate && (
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
        disabled={pending || !room || isFull}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Bergabung…" : "Gabung room"}
      </button>
    </form>
  );
}
