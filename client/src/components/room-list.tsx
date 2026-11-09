"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { listRooms } from "@/lib/api";
import { getGameSocket } from "@/lib/game-socket";
import type { RoomSummary } from "@/shared/contract";

type Props = {
  onSelect: (room: RoomSummary) => void;
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

/** Where a room stands for someone in the lobby. Only rooms that haven't started and have space can be joined. */
export function getRoomStatus(room: RoomSummary): { label: string; dot: string; joinable: boolean } {
  if (room.locked) return { label: "Sedang bermain", dot: "bg-amber-500", joinable: false };
  if (room.memberCount >= room.maxMembers) return { label: "Ruangan penuh", dot: "bg-red-500", joinable: false };
  return { label: "Belum mulai", dot: "bg-emerald-500", joinable: true };
}

export function RoomStatusLabel({ room }: { room: RoomSummary }) {
  const status = getRoomStatus(room);
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
      <span aria-hidden className={`h-2 w-2 rounded-full ${status.dot}`} />
      {status.label}
    </span>
  );
}

/**
 * Keeps room data fresh on any page that shows it: the server pushes "rooms:changed"
 * whenever a room is created/closed, players join/leave, or a game starts/ends.
 */
export function useLiveRoomData() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const s = getGameSocket();
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["room-peek"] });
    };
    s.on("rooms:changed", refresh);
    s.on("connect", refresh); // catch up on anything missed while disconnected
    return () => {
      s.off("rooms:changed", refresh);
      s.off("connect", refresh);
    };
  }, [queryClient]);
}

export default function RoomList({ onSelect }: Props) {
  const rooms = useQuery({ queryKey: ["rooms"], queryFn: listRooms, retry: false });
  useLiveRoomData();

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
            const { joinable } = getRoomStatus(room);
            return (
              <li key={room.id}>
                <button
                  type="button"
                  disabled={!joinable}
                  onClick={() => onSelect(room)}
                  className="flex w-full items-center gap-3 rounded-md border border-zinc-200 px-3 py-2 text-left transition-colors hover:border-blue-500 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:hover:border-zinc-200 dark:disabled:bg-zinc-900 disabled:hover:bg-transparent dark:border-zinc-800 dark:hover:bg-blue-950/20"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-semibold tracking-widest">{room.id}</p>
                    <p className="truncate text-xs text-zinc-500">
                      Host: {room.hostName ?? "—"} · {room.memberCount}/{room.maxMembers} pemain
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <VisibilityBadge isPrivate={room.hasPassword} />
                    <RoomStatusLabel room={room} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
