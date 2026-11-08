"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getGameSocket } from "@/lib/game-socket";
import type { RoomPreview } from "@/shared/socket-events";
import { listRooms } from "@/stores/room-store";

type Props = {
  onSelect: (room: RoomPreview) => void;
};

export function VisibilityBadge({ isPrivate }: { isPrivate: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
        isPrivate
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
      }`}
    >
      {isPrivate ? "🔒 Privat" : "🌐 Publik"}
    </span>
  );
}

export default function RoomList({ onSelect }: Props) {
  const queryClient = useQueryClient();
  const rooms = useQuery({ queryKey: ["rooms"], queryFn: listRooms, retry: false });

  // Server pushes "rooms:changed" whenever rooms are created/closed/joined/left.
  useEffect(() => {
    const s = getGameSocket();
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room-peek"] });
    };
    s.on("rooms:changed", refresh);
    s.on("connect", refresh); // catch up after a reconnect
    return () => {
      s.off("rooms:changed", refresh);
      s.off("connect", refresh);
    };
  }, [queryClient]);

  return (
    <section className="w-full max-w-sm space-y-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">
          Room tersedia {rooms.data && <span className="text-zinc-400">({rooms.data.length})</span>}
        </h2>
        <button
          type="button"
          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
          onClick={() => rooms.refetch()}
          disabled={rooms.isFetching}
        >
          {rooms.isFetching ? "memuat…" : "muat ulang"}
        </button>
      </div>

      {rooms.isPending && !rooms.isError && <p className="text-sm text-zinc-500">Memuat daftar room…</p>}
      {rooms.isError && <p className="text-sm text-red-600">{rooms.error.message}</p>}
      {rooms.data?.length === 0 && (
        <p className="text-sm text-zinc-500">Belum ada room. Buat yang pertama!</p>
      )}

      {rooms.data && rooms.data.length > 0 && (
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {rooms.data.map((room) => {
            const full = room.memberCount >= room.maxMembers;
            return (
              <li key={room.id}>
                <button
                  type="button"
                  disabled={full}
                  onClick={() => onSelect(room)}
                  className="flex w-full items-center gap-3 rounded-md border border-zinc-200 px-3 py-2 text-left transition-colors hover:border-blue-500 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-zinc-200 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-blue-950/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-semibold tracking-widest">{room.id}</p>
                    <p className="truncate text-xs text-zinc-500">
                      Host: {room.hostName} · {room.memberCount}/{room.maxMembers} pemain
                      {full && " · penuh"}
                    </p>
                  </div>
                  <VisibilityBadge isPrivate={room.isPrivate} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
