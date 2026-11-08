"use client";

import { useEffect } from "react";
import ChatRoom from "@/components/chat-room";
import Lobby from "@/components/lobby";
import SignInForm from "@/components/sign-in-form";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";

function Game() {
  const start = useRoomStore((s) => s.start);
  const inRoom = useRoomStore((s) => s.room !== null);

  // Reconnects with the stored session after a refresh; the server puts us back in our room.
  useEffect(() => start(), [start]);

  return inRoom ? <ChatRoom /> : <Lobby />;
}

export default function Home() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const signedIn = useAuthStore((s) => s.user !== null);

  // Read the guest session from sessionStorage (client only).
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-4 sm:p-6 dark:bg-black">
      {!hydrated ? null : signedIn ? <Game /> : <SignInForm />}
    </main>
  );
}
