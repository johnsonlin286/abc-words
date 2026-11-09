"use client";

import Link from "next/link";
import { useEffect } from "react";
import { isRoomCode } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import JoinRoomForm from "./join-room-form";
import { useLiveRoomData } from "./room-list";

const noop = () => {};

/** Join form for someone who opened /room/[code] without being a member yet. */
export default function RoomInvite({ code }: { code: string }) {
  const name = useAuthStore((s) => s.user?.name);
  const clearError = useRoomStore((s) => s.clearError);

  useEffect(() => clearError(), [clearError]);
  useLiveRoomData();

  return (
    <div className="w-full max-w-sm space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h1 className="text-xl font-semibold">Gabung room</h1>
        <p className="text-sm text-zinc-500">
          Masuk sebagai <span className="font-medium text-zinc-800 dark:text-zinc-200">{name}</span>
        </p>
      </div>

      {isRoomCode(code) ? (
        <JoinRoomForm code={code} onCodeChange={noop} codeLocked selectionId={1} />
      ) : (
        <p className="text-sm text-red-600">Kode room tidak valid.</p>
      )}

      <Link
        href="/"
        onClick={clearError}
        className="block w-full rounded-md border border-zinc-300 px-4 py-2 text-center text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Kembali ke beranda
      </Link>
    </div>
  );
}
