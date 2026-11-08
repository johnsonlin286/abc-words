import type { AckResponse, RoomSummary } from "@/shared/contract";

/** NESIO backend: Socket.IO and the REST API share one origin. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getJson<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  } catch {
    throw new Error("Tidak bisa terhubung ke server.");
  }
  const body = (await res.json().catch(() => null)) as AckResponse<T> | null;
  if (!body) throw new Error(`Server error (HTTP ${res.status}).`);
  if (!body.ok) throw new Error(body.error.message);
  return body.data;
}

/** Rooms listed in the lobby (public + password-protected), newest first. */
export const listRooms = () => getJson<RoomSummary[]>("/api/rooms");

/** Look a room up by code before joining (to know whether it needs a password). */
export const getRoomSummary = (code: string) =>
  getJson<RoomSummary>(`/api/rooms/${encodeURIComponent(code)}`);
