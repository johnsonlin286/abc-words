// Shared between the Socket.IO server (server/) and the Next.js client (src/).
// Keep this file free of runtime imports so both sides can use it.

export type Member = { id: string; name: string };

export type RoomInfo = {
  id: string; // short room code, e.g. "K7P2QX"
  isPrivate: boolean;
  hostId: string;
  members: Member[];
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  roomId: string;
  kind: "user" | "system";
  from?: Member;
  text: string;
  at: number;
};

export type Ack<T> = { ok: true; data: T } | { ok: false; error: string };

export type CreateRoomInput = {
  userName: string;
  isPrivate: boolean;
  password?: string;
};

export type JoinRoomInput = {
  roomId: string;
  userName: string;
  password?: string;
};

// Public preview of a room, used by the join form before actually joining.
export type RoomPreview = {
  id: string;
  isPrivate: boolean;
  memberCount: number;
  maxMembers: number;
  hostName: string;
  createdAt: number;
};

export const LIMITS = {
  roomCode: 6,
  maxMembers: 8,
  userName: 20,
  passwordMin: 4,
  passwordMax: 64,
  message: 500,
} as const;

export interface ServerToClientEvents {
  "chat:message": (message: ChatMessage) => void;
  "room:updated": (room: RoomInfo) => void;
  // Fired to every client whenever any room is created/closed or its members change.
  "rooms:changed": () => void;
}

export interface ClientToServerEvents {
  "room:create": (
    input: CreateRoomInput,
    ack: (res: Ack<{ room: RoomInfo; me: Member }>) => void,
  ) => void;
  "rooms:list": (ack: (res: Ack<RoomPreview[]>) => void) => void;
  "room:peek": (roomId: string, ack: (res: Ack<RoomPreview>) => void) => void;
  "room:join": (
    input: JoinRoomInput,
    ack: (res: Ack<{ room: RoomInfo; me: Member }>) => void,
  ) => void;
  "room:leave": (ack: (res: Ack<null>) => void) => void;
  "chat:send": (input: { text: string }, ack: (res: Ack<null>) => void) => void;
}

export type SocketData = {
  name?: string;
  roomId?: string;
};
