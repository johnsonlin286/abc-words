"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { listRooms } from "@/lib/api";
import { getGameSocket } from "@/lib/game-socket";
import { buttonSecondary, errorText, linkButton } from "@/components/ui";
import type { RoomSummary } from "@/shared/contract";

type Props = {
  onSelect: (room: RoomSummary) => void;
  /** Called from the empty list's "Buat room" button. */
  onCreate: () => void;
};

export function VisibilityBadge({ isPrivate }: { isPrivate: boolean }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border-2 border-ink bg-white px-2 py-0.5 text-xs font-semibold text-ink">
      <span aria-hidden>{isPrivate ? "🔒" : "🌐"}</span>
      {isPrivate ? "Privat" : "Publik"}
    </span>
  );
}

/** Where a room stands for someone in the lobby. Only rooms that haven't started and have space can be joined. */
export function getRoomStatus(room: RoomSummary): { label: string; dot: string; joinable: boolean } {
  if (room.locked) return { label: "Sedang bermain", dot: "bg-[#e0a21b]", joinable: false };
  if (room.memberCount >= room.maxMembers) return { label: "Ruangan penuh", dot: "bg-redpen", joinable: false };
  return { label: "Belum mulai", dot: "bg-success", joinable: true };
}

export function RoomStatusLabel({ room }: { room: RoomSummary }) {
  const status = getRoomStatus(room);
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink-soft">
      <span aria-hidden className={`size-2.5 rounded-full ${status.dot}`} />
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

export default function RoomList({ onSelect, onCreate }: Props) {
  const rooms = useQuery({ queryKey: ["rooms"], queryFn: listRooms, retry: false });
  useLiveRoomData();
  const count = rooms.data?.length;

  return (
    <section aria-labelledby="room-list-title" className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="room-list-title" className="text-lg font-bold">
          Room yang buka{count !== undefined && <span className="text-ink-faint"> ({count})</span>}
        </h2>
        <button
          type="button"
          className={`${linkButton} shrink-0 text-sm whitespace-nowrap`}
          onClick={() => rooms.refetch()}
          disabled={rooms.isFetching}
        >
          {rooms.isFetching ? "Memuat…" : "Muat ulang"}
        </button>
      </div>

      {rooms.isPending && !rooms.isError && <p className="text-ink-soft">Memuat daftar room…</p>}
      {rooms.isError && <p className={errorText}>{rooms.error.message}</p>}
      {count === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed border-ink-soft px-4 py-3.5">
          <p className="font-semibold">Belum ada room. Buat yang pertama!</p>
          <button type="button" onClick={onCreate} className={`${buttonSecondary} px-4 py-2 text-sm`}>
            Buat room
          </button>
        </div>
      )}

      {rooms.data && rooms.data.length > 0 && (
        <ul className="flex max-h-[26rem] flex-col gap-2.5 overflow-y-auto p-1">
          {rooms.data.map((room) => {
            const { joinable } = getRoomStatus(room);
            return (
              <li key={room.id}>
                <button
                  type="button"
                  disabled={!joinable}
                  onClick={() => onSelect(room)}
                  aria-label={`Room ${room.id}, host ${room.hostName ?? "tidak ada"}, ${room.memberCount} dari ${room.maxMembers} pemain, ${getRoomStatus(room).label}`}
                  className="flex w-full items-center gap-3 rounded-xl border-2 border-ink bg-white px-3.5 py-2.5 text-left hover:bg-highlight-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen disabled:cursor-not-allowed disabled:border-ink/25 disabled:bg-paper disabled:hover:bg-paper"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-lg leading-tight font-bold tracking-[0.15em] tabular-nums">{room.id}</p>
                    <p className="truncate text-sm text-ink-soft">
                      Host {room.hostName ?? "—"}, {room.memberCount}/{room.maxMembers} pemain
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
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
