import { create } from "zustand";
import { DEFAULT_SOCKET_URL, getSocket } from "@/lib/socket";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export type LogEntry = {
  id: number;
  direction: "in" | "out" | "system";
  event: string;
  payload?: unknown;
  at: number;
};

type SocketState = {
  url: string;
  status: ConnectionStatus;
  socketId: string | null;
  error: string | null;
  logs: LogEntry[];
  setUrl: (url: string) => void;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, payload?: unknown) => void;
  clearLogs: () => void;
};

let logId = 0;

export const useSocketStore = create<SocketState>((set, get) => {
  const log = (entry: Omit<LogEntry, "id" | "at">) =>
    set((s) => ({
      logs: [{ ...entry, id: ++logId, at: Date.now() }, ...s.logs].slice(0, 200),
    }));

  return {
    url: DEFAULT_SOCKET_URL,
    status: "disconnected",
    socketId: null,
    error: null,
    logs: [],

    setUrl: (url) => set({ url }),

    connect: () => {
      const socket = getSocket(get().url);
      socket.removeAllListeners();
      socket.offAny();

      socket.on("connect", () => {
        set({ status: "connected", socketId: socket.id ?? null, error: null });
        log({ direction: "system", event: "connect", payload: { id: socket.id } });
      });
      socket.on("disconnect", (reason) => {
        set({ status: "disconnected", socketId: null });
        log({ direction: "system", event: "disconnect", payload: { reason } });
      });
      socket.on("connect_error", (err) => {
        set({ status: "error", error: err.message });
        log({ direction: "system", event: "connect_error", payload: { message: err.message } });
      });
      socket.onAny((event, ...args) => {
        log({ direction: "in", event, payload: args.length <= 1 ? args[0] : args });
      });

      set({ status: "connecting", error: null });
      socket.connect();
    },

    disconnect: () => {
      getSocket(get().url).disconnect();
    },

    emit: (event, payload) => {
      const socket = getSocket(get().url);
      if (!socket.connected) return;
      if (payload === undefined) socket.emit(event);
      else socket.emit(event, payload);
      log({ direction: "out", event, payload });
    },

    clearLogs: () => set({ logs: [] }),
  };
});
