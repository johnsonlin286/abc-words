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

/** Room type = backend module that handles the room (backend/src/modules/abc-words). */
export const ROOM_TYPE = "abc-words";

export const MIN_PLAYERS = 2;
export const MAX_ROUNDS = 10;
export const CUSTOM_CATEGORY_MAX = 40;
export const ANSWER_MIN = 2;
export const ANSWER_MAX = 40;

export const CATEGORIES = [
  { id: "bebas", label: "Bebas" },
  { id: "hewan", label: "Hewan" },
  { id: "lagu", label: "Judul lagu" },
  { id: "film", label: "Judul film" },
  { id: "kota-indonesia", label: "Kota di Indonesia" },
  { id: "negara", label: "Negara" },
  { id: "custom", label: "Lainnya" },
] as const;

export const LANGUAGES = [
  { id: "id", label: "Indonesia" },
  { id: "en", label: "English" },
] as const;

/** Mirrors `AbcWordsSettings` in backend/src/modules/abc-words. */
export type GameSettings = {
  category: (typeof CATEGORIES)[number]["id"];
  customCategory: string;
  language: (typeof LANGUAGES)[number]["id"];
  maxRounds: number;
};

/** Mirrors `ChatMessage` / `ChatState` in backend/src/modules/chat. `userId: null` = system message. */
export type ChatMessage = {
  id: string;
  userId: string | null;
  name: string;
  text: string;
  at: number;
};
export type ChatState = { messages: ChatMessage[] };
/** Mirrors `AbcWordsState` in backend/src/modules/abc-words. */
export type GameState = ChatState & {
  phase: "waiting" | "picking" | "reveal" | "answering" | "voting" | "result" | "finished";
  round: number;
  /** Time left in this phase when the server sent it; null when the phase has no limit. */
  remainingMs: number | null;
  /** Full length of this phase, for the countdown bar. */
  phaseMs: number | null;
  /** Why the last game ended; shown in the waiting room until the next game starts. */
  endedReason: string | null;
  usedLetters: string[];
  /** Who has picked a number. The numbers themselves stay secret until the reveal. */
  pickedBy: string[];
  myPick: number | null;
  reveal: RevealInfo | null;
  answers: {
    userId: string;
    name: string;
    text: string;
    at: number;
    rejectedBy: { userId: string; name: string }[];
    /** Voting result; null until voting ends. */
    accepted: boolean | null;
  }[];
  scores: Record<string, number>;
  /** How many answers this player can still reject in this game. */
  rejectionsLeft: number;
};

export type RevealInfo = {
  picks: { userId: string; name: string; value: number; auto: boolean }[];
  total: number;
  letter: string;
  skippedFrom: string | null;
};

/** Players still in the room, best score first. Equal scores share a rank. */
export function rankPlayers(
  members: { userId: string; name: string }[],
  scores: Record<string, number>,
): { userId: string; name: string; score: number; rank: number }[] {
  const sorted = members
    .map((m) => ({ userId: m.userId, name: m.name, score: scores[m.userId] ?? 0 }))
    .sort((a, b) => b.score - a.score);
  return sorted.map((p) => ({ ...p, rank: sorted.findIndex((o) => o.score === p.score) + 1 }));
}

export function categoryLabel(settings: GameSettings): string {
  if (settings.category === "custom") return settings.customCategory;
  return CATEGORIES.find((c) => c.id === settings.category)!.label;
}

/** Same format rule as the server. Returns an error message, or null when acceptable. */
export function validateAnswer(text: string, letter: string): string | null {
  const key = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
  if (key.length < ANSWER_MIN || key.length > ANSWER_MAX || !/^[a-z ]+$/.test(key)) {
    return `Jawaban harus ${ANSWER_MIN}–${ANSWER_MAX} karakter, hanya huruf dan spasi.`;
  }
  if (key[0].toUpperCase() !== letter) return `Jawaban harus berawalan huruf ${letter}.`;
  return null;
}

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
