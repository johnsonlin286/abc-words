import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Player = { userId: string; name: string };

type AuthState = {
  /** Name sent in the handshake (set right before the first connect). */
  name: string | null;
  /** Signed guest token from the server's `session` event; keeps the same userId. */
  sessionToken: string | null;
  /** Set once the server accepted the connection. */
  user: Player | null;
  /** True once the persisted session has been read from sessionStorage. */
  hydrated: boolean;
  /** Message shown on the sign-in form after being signed out by the server. */
  notice: string | null;
  setSession: (session: { user: Player; sessionToken: string | null }) => void;
  clearSession: (notice?: string) => void;
};

// Guest session lives in sessionStorage: survives a refresh, is separate per tab
// (so each tab is its own player), and is gone when the tab is closed. No email, no password:
// the identity is a server-generated UUID inside an HMAC-signed session token.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      name: null,
      sessionToken: null,
      user: null,
      hydrated: false,
      notice: null,
      setSession: ({ user, sessionToken }) => set({ user, name: user.name, sessionToken, notice: null }),
      clearSession: (notice) => set({ user: null, name: null, sessionToken: null, notice: notice ?? null }),
    }),
    {
      name: "abc-words-player",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ name: s.name, sessionToken: s.sessionToken, user: s.user }),
      skipHydration: true, // rehydrated manually on the client to avoid SSR mismatch
      onRehydrateStorage: () => () => useAuthStore.setState({ hydrated: true }),
    },
  ),
);
