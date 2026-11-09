"use client";

import { useEffect } from "react";
import SignInForm from "@/components/sign-in-form";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";

function Connected({ children }: { children: React.ReactNode }) {
  const start = useRoomStore((s) => s.start);

  // Reconnects with the stored session after a refresh; the server puts us back in our room.
  useEffect(() => start(), [start]);

  return children;
}

/**
 * Wraps the content of every game page (inside the page, so layouts keep rendering
 * their segment on the server): asks for a name first, without changing the URL,
 * so someone opening an invite link lands back on that room after signing in.
 */
export default function SessionGate({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const signedIn = useAuthStore((s) => s.user !== null);

  // Read the guest session from sessionStorage (client only).
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  if (!hydrated) return null;
  return signedIn ? <Connected>{children}</Connected> : <SignInForm />;
}
