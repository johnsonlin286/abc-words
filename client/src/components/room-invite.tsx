"use client";

import Link from "next/link";
import { useEffect } from "react";
import { buttonSecondary, errorText } from "@/components/ui";
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
    <div className="note-card flex w-full max-w-md flex-col gap-5 p-5 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Gabung room</h1>
        <p className="text-ink-soft">
          Masuk sebagai <span className="font-bold text-ink">{name}</span>
        </p>
      </div>

      {isRoomCode(code) ? (
        <JoinRoomForm code={code} onCodeChange={noop} codeLocked selectionId={1} />
      ) : (
        <p className={errorText}>Kode room tidak valid. Cek lagi link undangannya.</p>
      )}

      <Link
        href="/"
        onClick={clearError}
        className={buttonSecondary}
      >
        Kembali ke beranda
      </Link>
    </div>
  );
}
