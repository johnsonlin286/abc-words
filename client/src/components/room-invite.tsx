"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isRoomCode } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import JoinRoomForm from "./join-room-form";

const noop = () => {};

/** Join form for someone who opened /room/[code] without being a member yet. */
export default function RoomInvite({ code }: { code: string }) {
  const router = useRouter();
  const name = useAuthStore((s) => s.user?.name);
  const clearError = useRoomStore((s) => s.clearError);

  useEffect(() => clearError(), [clearError]);

  const backToLobby = () => {
    clearError();
    router.push("/");
  };

  return (
    <div className="w-full max-w-sm space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h1 className="text-xl font-semibold">Gabung room</h1>
        <p className="text-sm text-zinc-500">
          Masuk sebagai <span className="font-medium text-zinc-800 dark:text-zinc-200">{name}</span>
        </p>
      </div>

      {isRoomCode(code) ? (
        <JoinRoomForm
          code={code}
          onCodeChange={noop}
          codeLocked
          onUnlockCode={backToLobby}
          unlockLabel="Kembali ke lobby"
          selectionId={1}
        />
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-red-600">Kode room tidak valid.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Kembali ke lobby
          </Link>
        </div>
      )}
    </div>
  );
}
