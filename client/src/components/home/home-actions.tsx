"use client";

import { useEffect, useRef, useState } from "react";
import LobbyRoute from "@/components/lobby-route";
import RoomList from "@/components/room-list";
import { Connected } from "@/components/session-gate";
import SignInForm from "@/components/sign-in-form";
import type { RoomSummary } from "@/shared/contract";
import { useAuthStore } from "@/stores/auth-store";

/**
 * The playing part of the home page. Signed out: a name field, plus the open rooms so visitors
 * see the game is alive (picking one asks for a name first, then opens that room).
 * Signed in: create or join a room.
 */
export default function HomeActions() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const signedIn = useAuthStore((s) => s.user !== null);
  const [pendingRoom, setPendingRoom] = useState<RoomSummary | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Read the guest session from sessionStorage (client only).
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  // Keeps the layout from jumping while the session is read.
  if (!hydrated) return <div aria-hidden className="h-72" />;

  if (signedIn) {
    return (
      <Connected>
        <LobbyRoute initialRoom={pendingRoom} onInitialRoomUsed={() => setPendingRoom(null)} />
      </Connected>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <SignInForm
        ref={nameRef}
        message={
          pendingRoom
            ? pendingRoom.hasPassword
              ? `Tulis namamu dulu. Setelah itu masukkan kata sandi room ${pendingRoom.id}.`
              : `Tulis namamu dulu, lalu kamu langsung masuk ke room ${pendingRoom.id}.`
            : null
        }
      />
      <RoomList
        onSelect={(room) => {
          setPendingRoom(room);
          nameRef.current?.focus();
          nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      />
    </div>
  );
}
