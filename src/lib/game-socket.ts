import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/shared/socket-events";
import { DEFAULT_SOCKET_URL } from "./socket";

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: GameSocket | null = null;

export function getGameSocket(): GameSocket {
  if (!socket) {
    socket = io(DEFAULT_SOCKET_URL, { autoConnect: false, transports: ["websocket", "polling"] });
  }
  return socket;
}

export function ensureConnected(s: GameSocket, timeoutMs = 5000): Promise<void> {
  if (s.connected) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      s.off("connect", onConnect);
      s.off("connect_error", onError);
    };
    const onConnect = () => {
      cleanup();
      resolve();
    };
    const onError = (err: Error) => {
      cleanup();
      s.disconnect(); // stop auto-retrying in the background
      reject(new Error(`Tidak bisa terhubung ke server (${err.message}).`));
    };
    const timer = setTimeout(() => onError(new Error("timeout")), timeoutMs);
    s.on("connect", onConnect);
    s.on("connect_error", onError);
    s.connect();
  });
}
