"use client";

import ChatRoom from "@/components/chat-room";
import Lobby from "@/components/lobby";
import { useRoomStore } from "@/stores/room-store";

export default function Home() {
  const inRoom = useRoomStore((s) => s.room !== null);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-4 sm:p-6 dark:bg-black">
      {inRoom ? <ChatRoom /> : <Lobby />}
    </main>
  );
}
