// Client-side rules for ABC Words on top of the NESIO contract (./contract.ts).
// ./contract.ts is copied verbatim from backend/src/shared/contract.ts — keep it in sync.

export const LIMITS = {
  roomCode: 6,
  maxMembers: 8,
  userNameMin: 3,
  userName: 20,
  passwordMin: 4,
  passwordMax: 64,
  message: 500,
} as const;

/** Room codes in URLs and forms: uppercase letters and digits. Expects an uppercased string. */
export function isRoomCode(code: string): boolean {
  return code.length === LIMITS.roomCode && /^[A-Z0-9]+$/.test(code);
}

/** Room type = backend module that handles the room (backend/src/modules/chat). */
export const ROOM_TYPE = "chat";

/** Mirrors `ChatMessage` / `ChatState` in backend/src/modules/chat. `userId: null` = system message. */
export type ChatMessage = {
  id: string;
  userId: string | null;
  name: string;
  text: string;
  at: number;
};
export type ChatState = { messages: ChatMessage[] };

// connect_error codes from backend/src/project/player-names.ts
export const INVALID_NAME = "INVALID_NAME";
export const NAME_TAKEN = "NAME_TAKEN";
export const UNAUTHORIZED = "UNAUTHORIZED";

// ---------- user name validation (same rule as backend/src/project/player-names.ts) ----------

/** Whitelist: ASCII letters, digits, underscore and dash only. */
export const USER_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
/** Same rule for the HTML `pattern` attribute. */
export const USER_NAME_HTML_PATTERN = "[A-Za-z0-9_\\-]+";
export const USER_NAME_HINT = `${LIMITS.userNameMin}–${LIMITS.userName} karakter: huruf, angka, _ atau -`;

/** Returns an error message, or null when the name is valid. Expects a trimmed string. */
export function validateUserName(name: string): string | null {
  if (!name) return "Nama wajib diisi.";
  if (name.length < LIMITS.userNameMin) return `Nama minimal ${LIMITS.userNameMin} karakter.`;
  if (name.length > LIMITS.userName) return `Nama maksimal ${LIMITS.userName} karakter.`;
  if (!USER_NAME_PATTERN.test(name)) {
    return "Nama hanya boleh berisi huruf, angka, underscore (_) dan dash (-).";
  }
  return null;
}
