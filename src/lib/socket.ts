import { io, type Socket } from "socket.io-client";

export const DEFAULT_SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

// Single socket instance for the whole app (client-side only).
let socket: Socket | null = null;
let currentUrl: string | null = null;

export function getSocket(url: string = DEFAULT_SOCKET_URL): Socket {
  if (socket && currentUrl === url) return socket;

  socket?.disconnect();
  socket = io(url, {
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
  });
  currentUrl = url;
  return socket;
}
