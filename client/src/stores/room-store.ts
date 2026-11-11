import { create } from "zustand";
import { getGameSocket, request, type GameSocket } from "@/lib/game-socket";
import type { RoomView } from "@/shared/contract";
import {
  INVALID_NAME,
  LIMITS,
  NAME_TAKEN,
  ROOM_TYPE,
  UNAUTHORIZED,
  type ChatMessage,
  type GameSettings,
  type GameState,
  type RejectReason,
} from "@/shared/game";
import { useAuthStore } from "./auth-store";

const SIGN_IN_TIMEOUT = 5000;
const MAX_MESSAGES = 200;

export type Connection = "idle" | "connecting" | "online" | "reconnecting";
export type GameRoomView = RoomView<GameState, GameSettings>;
export type AnswerOutcome =
  | { status: "accepted" }
  | { status: "duplicate" | "near-tie" | "error"; message: string };

const ANSWER_MESSAGES = {
  duplicate: "Kata itu sudah dijawab pemain lain. Coba kata lain.",
  "near-tie": "Keduluan! Kata itu baru saja masuk. Waktumu ditambah, coba kata lain.",
};

type RoomState = {
  connection: Connection;
  /** True once the server has told us, after connecting, whether we are in a room. */
  ready: boolean;
  /** The room the server says we are in. Routes navigate from this, not from user actions. */
  roomId: string | null;
  room: GameRoomView | null;
  messages: ChatMessage[];
  /** Local time at which the current game phase ends; null when it has no limit. */
  phaseEndsAt: number | null;
  pending: boolean;
  error: string | null;
  /** Shown in the lobby after being kicked / the room closing. */
  notice: string | null;
  /** Connect with a new name; resolves once the server accepted it. */
  signIn: (name: string) => Promise<void>;
  /** Bind socket listeners (once) and connect with the stored session. Safe to call repeatedly. */
  start: () => void;
  createRoom: (input: { isPrivate: boolean; password?: string }) => Promise<boolean>;
  joinRoom: (input: { roomId: string; password?: string }) => Promise<boolean>;
  /** Host only. Resolves with an error message, or null when saved. */
  updateSettings: (patch: Partial<GameSettings>) => Promise<string | null>;
  /** Host only. Resolve with an error message, or null on success. */
  startGame: () => Promise<string | null>;
  endGame: () => Promise<string | null>;
  pickNumber: (value: number) => Promise<string | null>;
  submitAnswer: (text: string) => Promise<AnswerOutcome>;
  /** Reject with a reason (or change the reason); `null` cancels the rejection. */
  setRejection: (answerUserId: string, reason: RejectReason | null) => Promise<string | null>;
  sendMessage: (text: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const NAME_ERRORS: Record<string, string> = {
  [NAME_TAKEN]: "Nama sudah digunakan pemain lain. Pilih nama lain.",
  [INVALID_NAME]: "Nama tidak valid. Gunakan huruf, angka, _ atau -.",
};

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Terjadi kesalahan.";
}

/** Append without duplicates: a message can arrive both in `room:state` and as an event. */
function mergeMessage(list: ChatMessage[], msg: ChatMessage): ChatMessage[] {
  return list.some((m) => m.id === msg.id) ? list : [...list, msg].slice(-MAX_MESSAGES);
}

const NO_ROOM = { roomId: null, room: null, messages: [] as ChatMessage[], phaseEndsAt: null };

export const useRoomStore = create<RoomState>((set, get) => {
  let bound: GameSocket | null = null;
  /** While true, connect errors are reported to the sign-in form instead of signing out. */
  let signingIn = false;

  const showRoom = (room: GameRoomView) =>
    set({
      roomId: room.id,
      room,
      messages: room.state.messages.slice(-MAX_MESSAGES),
      phaseEndsAt: room.state.remainingMs === null ? null : Date.now() + room.state.remainingMs,
    });

  const socket = (): GameSocket => {
    if (bound) return bound;
    const s = getGameSocket();

    // Sent after every successful (re)connect; the server restores our room by itself.
    s.on("session", (session) => {
      useAuthStore.getState().setSession({
        user: { userId: session.userId, name: session.name },
        sessionToken: session.sessionToken,
      });
      // No room: e.g. it expired or the server restarted. Otherwise `room:state` follows.
      set(session.roomId ? { ready: true, roomId: session.roomId } : { ready: true, ...NO_ROOM });
    });
    // Full snapshot of our room: the source of truth.
    s.on("room:state", (room) => showRoom(room as GameRoomView));
    s.on("room:event", ({ roomId, event, data }) => {
      if (event !== "chat:message" || roomId !== get().room?.id) return;
      set((st) => ({ messages: mergeMessage(st.messages, data as ChatMessage) }));
    });
    s.on("room:kicked", () => set({ ...NO_ROOM, notice: "Kamu dikeluarkan dari room oleh host." }));
    s.on("room:closed", ({ reason }) =>
      set({
        ...NO_ROOM,
        notice: reason === "idle" ? "Room ditutup karena tidak ada aktivitas." : "Room sudah ditutup.",
      }),
    );

    s.on("connect", () => set({ connection: "online", error: null }));
    s.on("disconnect", (reason) => {
      // Client/server-initiated disconnects don't auto-reconnect; network drops do.
      set({ connection: reason === "io client disconnect" ? "idle" : "reconnecting" });
    });
    s.on("connect_error", (err) => {
      const isAuthError = err.message in NAME_ERRORS || err.message === UNAUTHORIZED;
      if (!isAuthError) return set({ connection: signingIn ? "connecting" : "reconnecting" });

      s.disconnect();
      set({ ...NO_ROOM, ready: false, connection: "idle" });
      // Sign-in form shows the error itself; otherwise (e.g. reconnecting after the name
      // was taken while we were away) go back to the sign-in form with a notice.
      if (!signingIn) {
        useAuthStore.getState().clearSession(NAME_ERRORS[err.message] ?? "Sesi berakhir. Silakan masuk lagi.");
      }
    });

    bound = s;
    return s;
  };

  // Shared flow for create/join.
  const enter = async (run: () => Promise<RoomView>): Promise<boolean> => {
    set({ pending: true, error: null, notice: null });
    try {
      showRoom((await run()) as GameRoomView);
      return true;
    } catch (e) {
      set({ error: errorMessage(e) });
      return false;
    } finally {
      set({ pending: false });
    }
  };

  // The new phase arrives through `room:state`.
  const gameAction = async (action: string, payload?: unknown): Promise<string | null> => {
    try {
      await request("room:action", { action, ...(payload !== undefined && { payload }) });
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  };

  return {
    connection: "idle",
    ready: false,
    ...NO_ROOM,
    pending: false,
    error: null,
    notice: null,

    signIn: async (name) => {
      const s = socket();
      s.disconnect();
      useAuthStore.setState({ name, sessionToken: null, user: null });
      signingIn = true;
      set({ connection: "connecting" });
      try {
        await new Promise<void>((resolve, reject) => {
          const done = (error?: Error) => {
            clearTimeout(timer);
            s.off("session", onSession);
            s.off("connect_error", onError);
            if (error) reject(error);
            else resolve();
          };
          const onSession = () => done();
          const onError = (err: Error) =>
            done(new Error(NAME_ERRORS[err.message] ?? "Tidak bisa terhubung ke server."));
          const timer = setTimeout(() => done(new Error("Server tidak merespons.")), SIGN_IN_TIMEOUT);
          s.on("session", onSession);
          s.on("connect_error", onError);
          s.connect();
        });
      } catch (e) {
        s.disconnect();
        useAuthStore.setState({ name: null });
        throw e;
      } finally {
        signingIn = false;
      }
    },

    start: () => {
      const s = socket();
      if (s.connected || s.active || !useAuthStore.getState().user) return;
      set({ connection: "connecting" });
      s.connect();
    },

    createRoom: ({ isPrivate, password }) =>
      enter(() =>
        request("room:create", {
          type: ROOM_TYPE,
          maxMembers: LIMITS.maxMembers,
          // Every room is listed in the lobby; "private" means it needs a password.
          isPublic: true,
          ...(isPrivate && password && { password }),
        }),
      ),

    joinRoom: ({ roomId, password }) =>
      enter(() => request("room:join", { roomId, ...(password && { password }) })),

    updateSettings: async (patch) => {
      const before = get().room;
      if (!before) return "Kamu tidak sedang berada di room.";
      // Applied right away so quick repeated clicks build on each other.
      set({ room: { ...before, settings: { ...before.settings, ...patch } } });
      try {
        await request("room:update", { settings: patch });
        return null; // the saved settings arrive through `room:state`
      } catch (e) {
        set((st) => (st.room ? { room: { ...st.room, settings: before.settings } } : {}));
        return errorMessage(e);
      }
    },

    startGame: () => gameAction("start"),
    endGame: () => gameAction("end"),
    pickNumber: (value) => gameAction("pick", { value }),
    setRejection: (answerUserId, reason) =>
      gameAction("reject", reason ? { answerUserId, rejected: true, reason } : { answerUserId, rejected: false }),

    submitAnswer: async (text) => {
      try {
        const { status } = (await request("room:action", { action: "answer", payload: { text } })) as {
          status: "accepted" | "duplicate" | "near-tie";
        };
        return status === "accepted" ? { status } : { status, message: ANSWER_MESSAGES[status] };
      } catch (e) {
        return { status: "error", message: errorMessage(e) };
      }
    },

    sendMessage: async (text) => {
      try {
        const msg = (await request("room:action", { action: "send", payload: { text } })) as ChatMessage;
        set((st) => ({ messages: mergeMessage(st.messages, msg), error: null }));
        return true;
      } catch (e) {
        set({ error: errorMessage(e) });
        return false;
      }
    },

    leaveRoom: async () => {
      // On error (e.g. NOT_IN_ROOM, timeout) we leave locally regardless.
      await request("room:leave").catch(() => {});
      set({ ...NO_ROOM, error: null });
    },

    signOut: async () => {
      const s = socket();
      // Leave right away so the name is free immediately (not after the reconnect grace period).
      if (s.connected && get().room) await request("room:leave").catch(() => {});
      s.disconnect();
      set({ ...NO_ROOM, ready: false, connection: "idle", error: null, notice: null });
      useAuthStore.getState().clearSession();
    },

    clearError: () => set({ error: null }),
  };
});
