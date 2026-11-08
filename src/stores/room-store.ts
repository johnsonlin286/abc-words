import { create } from "zustand";
import { ensureConnected, getGameSocket, type GameSocket } from "@/lib/game-socket";
import type {
  Ack,
  ChatMessage,
  CreateRoomInput,
  JoinRoomInput,
  Member,
  RoomInfo,
  RoomPreview,
} from "@/shared/socket-events";

const ACK_TIMEOUT = 5000;
const MAX_MESSAGES = 200;

type RoomState = {
  me: Member | null;
  room: RoomInfo | null;
  messages: ChatMessage[];
  pending: boolean;
  error: string | null;
  createRoom: (input: CreateRoomInput) => Promise<boolean>;
  joinRoom: (input: JoinRoomInput) => Promise<boolean>;
  sendMessage: (text: string) => Promise<boolean>;
  leaveRoom: () => Promise<void>;
  clearError: () => void;
};

function errorMessage(e: unknown): string {
  if (e instanceof Error) {
    // socket.io's timeout() rejects with "operation has timed out"
    return e.message.includes("timed out") ? "Server tidak merespons." : e.message;
  }
  return "Terjadi kesalahan.";
}

export const useRoomStore = create<RoomState>((set, get) => {
  let bound: GameSocket | null = null;

  // Lazily create the socket and attach listeners once (client-side only).
  const socket = (): GameSocket => {
    if (bound) return bound;
    const s = getGameSocket();

    s.on("chat:message", (msg) => {
      if (msg.roomId !== get().room?.id) return;
      set((st) => ({ messages: [...st.messages, msg].slice(-MAX_MESSAGES) }));
    });
    s.on("room:updated", (room) => {
      if (room.id === get().room?.id) set({ room });
    });
    s.on("disconnect", (reason) => {
      // Server forgets our membership on disconnect, so drop back to the lobby.
      if (get().room && reason !== "io client disconnect") {
        set({ room: null, me: null, messages: [], error: "Koneksi ke server terputus." });
      }
    });

    bound = s;
    return s;
  };

  // Shared flow for create/join: connect, send the request, store the result.
  const enter = async (
    request: (s: GameSocket) => Promise<Ack<{ room: RoomInfo; me: Member }>>,
  ): Promise<boolean> => {
    set({ pending: true, error: null });
    try {
      const s = socket();
      await ensureConnected(s);
      const res = await request(s);
      if (!res.ok) {
        set({ error: res.error });
        return false;
      }
      set({ room: res.data.room, me: res.data.me, messages: [] });
      return true;
    } catch (e) {
      set({ error: errorMessage(e) });
      return false;
    } finally {
      set({ pending: false });
    }
  };

  return {
    me: null,
    room: null,
    messages: [],
    pending: false,
    error: null,

    createRoom: (input) =>
      enter((s) => s.timeout(ACK_TIMEOUT).emitWithAck("room:create", input)),

    joinRoom: (input) =>
      enter((s) => s.timeout(ACK_TIMEOUT).emitWithAck("room:join", input)),

    sendMessage: async (text) => {
      try {
        const res = await socket().timeout(ACK_TIMEOUT).emitWithAck("chat:send", { text });
        if (!res.ok) set({ error: res.error });
        return res.ok;
      } catch (e) {
        set({ error: errorMessage(e) });
        return false;
      }
    },

    leaveRoom: async () => {
      try {
        await socket().timeout(ACK_TIMEOUT).emitWithAck("room:leave");
      } catch {
        // ignore: we leave locally regardless
      }
      set({ room: null, me: null, messages: [], error: null });
    },

    clearError: () => set({ error: null }),
  };
});

// Used by the join form (via TanStack Query) to look up a room before joining.
// Throws on error so the query lands in its error state.
export async function peekRoom(code: string): Promise<RoomPreview> {
  const s = getGameSocket();
  await ensureConnected(s);
  const res = await s.timeout(ACK_TIMEOUT).emitWithAck("room:peek", code);
  if (!res.ok) throw new Error(res.error);
  return res.data;
}

// Used by the lobby room list (via TanStack Query).
export async function listRooms(): Promise<RoomPreview[]> {
  const s = getGameSocket();
  await ensureConnected(s);
  const res = await s.timeout(ACK_TIMEOUT).emitWithAck("rooms:list");
  if (!res.ok) throw new Error(res.error);
  return res.data;
}
