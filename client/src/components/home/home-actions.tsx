"use client";

import { useEffect, useRef, useState } from "react";
import LobbyRoute from "@/components/lobby-route";
import RoomList from "@/components/room-list";
import { Connected } from "@/components/session-gate";
import SignInForm from "@/components/sign-in-form";
import type { RoomSummary } from "@/shared/contract";
import { useAuthStore } from "@/stores/auth-store";
import { START_ID } from "./hero-cta";

/**
 * The playing part of the home page. Signed out: a name field, plus the open rooms so visitors
 * see the game is alive (picking one asks for a name first, then opens that room).
 * Signed in: create or join a room.
 */
export default function HomeActions() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const signedIn = useAuthStore((s) => s.user !== null);
  const [pendingRoom, setPendingRoom] = useState<RoomSummary | null>(null);
  const [wantsToCreate, setWantsToCreate] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Read the guest session from sessionStorage (client only).
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  const focusName = () => {
    nameRef.current?.focus();
    nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Arriving from "Main sekarang" on another page (`/#mulai`) without a name yet: go straight to
  // the name field, then drop the hash so a reload or Back doesn't jump there again.
  useEffect(() => {
    if (!hydrated || signedIn || window.location.hash !== `#${START_ID}`) return;
    nameRef.current?.focus({ preventScroll: true });
    nameRef.current?.scrollIntoView({ block: "center" });
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  }, [hydrated, signedIn]);

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
            : wantsToCreate
              ? "Tulis namamu dulu, lalu kamu bisa langsung buat room."
              : null
        }
      />
      <RoomList
        onSelect={(room) => {
          setPendingRoom(room);
          focusName();
        }}
        onCreate={() => {
          // After signing in the lobby opens on "Buat room", so only the name is missing.
          setPendingRoom(null);
          setWantsToCreate(true);
          focusName();
        }}
      />
    </div>
  );
}
