import { randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import {
  LIMITS,
  type ChatMessage,
  type ClientToServerEvents,
  type Member,
  type RoomInfo,
  type RoomPreview,
  type ServerToClientEvents,
  type SocketData,
} from "../src/shared/socket-events";

const PORT = Number(process.env.SOCKET_PORT ?? 3001);
const CORS_ORIGIN = (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(",");

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;

type Room = {
  id: string;
  isPrivate: boolean;
  passwordHash: string | null; // "salt:hash", used later when others join
  hostId: string;
  members: Map<string, Member>;
  createdAt: number;
};

const rooms = new Map<string, Room>();

// ---------- helpers ----------

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function generateRoomCode(): string {
  let code: string;
  do {
    code = Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("");
  } while (rooms.has(code));
  return code;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

// Returns an error message, or null when the name is valid.
function validateUserName(userName: string): string | null {
  if (!userName) return "Nama wajib diisi.";
  if (userName.length > LIMITS.userName) return `Nama maksimal ${LIMITS.userName} karakter.`;
  return null;
}

function normalizeRoomCode(code: unknown): string {
  return String(code ?? "").trim().toUpperCase();
}

function toRoomPreview(room: Room): RoomPreview {
  return {
    id: room.id,
    isPrivate: room.isPrivate,
    memberCount: room.members.size,
    maxMembers: LIMITS.maxMembers,
    hostName: room.members.get(room.hostId)?.name ?? "-",
    createdAt: room.createdAt,
  };
}

function toRoomInfo(room: Room): RoomInfo {
  return {
    id: room.id,
    isPrivate: room.isPrivate,
    hostId: room.hostId,
    members: [...room.members.values()],
    createdAt: room.createdAt,
  };
}

function systemMessage(roomId: string, text: string): ChatMessage {
  return { id: randomUUID(), roomId, kind: "system", text, at: Date.now() };
}

// ---------- server ----------

const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }
  res.writeHead(404).end();
});

const io = new Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>(httpServer, {
  cors: { origin: CORS_ORIGIN },
});

// Tell every client the room list changed; they refetch via "rooms:list".
function notifyRoomsChanged() {
  io.emit("rooms:changed");
}

function leaveCurrentRoom(socket: GameSocket) {
  const roomId = socket.data.roomId;
  if (!roomId) return;

  socket.leave(roomId);
  socket.data.roomId = undefined;

  const room = rooms.get(roomId);
  if (!room) return;

  const member = room.members.get(socket.id);
  room.members.delete(socket.id);

  if (room.members.size === 0) {
    rooms.delete(roomId);
    console.log(`[room] ${roomId} closed (empty)`);
    notifyRoomsChanged();
    return;
  }

  if (room.hostId === socket.id) {
    room.hostId = room.members.keys().next().value!;
  }

  io.to(roomId).emit("chat:message", systemMessage(roomId, `${member?.name ?? "Seseorang"} keluar dari room`));
  io.to(roomId).emit("room:updated", toRoomInfo(room));
  notifyRoomsChanged();
}

io.on("connection", (socket) => {
  console.log(`[conn] ${socket.id} connected`);

  socket.on("room:create", (input, ack) => {
    if (typeof ack !== "function") return;

    if (socket.data.roomId) {
      return ack({ ok: false, error: "Kamu sudah berada di sebuah room." });
    }

    const userName = String(input?.userName ?? "").trim();
    const isPrivate = Boolean(input?.isPrivate);
    const password = String(input?.password ?? "");

    const nameError = validateUserName(userName);
    if (nameError) return ack({ ok: false, error: nameError });
    if (isPrivate && password.length < LIMITS.passwordMin) {
      return ack({
        ok: false,
        error: `Kata sandi wajib untuk room privat (min. ${LIMITS.passwordMin} karakter).`,
      });
    }
    if (password.length > LIMITS.passwordMax) {
      return ack({ ok: false, error: `Kata sandi maksimal ${LIMITS.passwordMax} karakter.` });
    }

    const me: Member = { id: socket.id, name: userName };
    const room: Room = {
      id: generateRoomCode(),
      isPrivate,
      passwordHash: isPrivate ? hashPassword(password) : null,
      hostId: socket.id,
      members: new Map([[socket.id, me]]),
      createdAt: Date.now(),
    };
    rooms.set(room.id, room);

    socket.data.name = userName;
    socket.data.roomId = room.id;
    socket.join(room.id);

    console.log(`[room] ${room.id} created by ${userName} (${isPrivate ? "private" : "public"})`);

    ack({ ok: true, data: { room: toRoomInfo(room), me } });
    io.to(room.id).emit("chat:message", systemMessage(room.id, `${userName} membuat room`));
    notifyRoomsChanged();
  });

  socket.on("rooms:list", (ack) => {
    if (typeof ack !== "function") return;
    const list = [...rooms.values()]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(toRoomPreview);
    ack({ ok: true, data: list });
  });

  socket.on("room:peek", (code, ack) => {
    if (typeof ack !== "function") return;
    const room = rooms.get(normalizeRoomCode(code));
    if (!room) return ack({ ok: false, error: "Room tidak ditemukan." });
    ack({ ok: true, data: toRoomPreview(room) });
  });

  socket.on("room:join", (input, ack) => {
    if (typeof ack !== "function") return;

    if (socket.data.roomId) {
      return ack({ ok: false, error: "Kamu sudah berada di sebuah room." });
    }

    const room = rooms.get(normalizeRoomCode(input?.roomId));
    if (!room) return ack({ ok: false, error: "Room tidak ditemukan." });

    const userName = String(input?.userName ?? "").trim();
    const nameError = validateUserName(userName);
    if (nameError) return ack({ ok: false, error: nameError });

    if (room.members.size >= LIMITS.maxMembers) {
      return ack({ ok: false, error: `Room sudah penuh (maks. ${LIMITS.maxMembers} pemain).` });
    }

    const nameTaken = [...room.members.values()].some(
      (m) => m.name.toLowerCase() === userName.toLowerCase(),
    );
    if (nameTaken) return ack({ ok: false, error: "Nama sudah dipakai di room ini." });

    if (room.passwordHash) {
      const password = String(input?.password ?? "");
      if (!password) return ack({ ok: false, error: "Kata sandi wajib diisi." });
      if (!verifyPassword(password, room.passwordHash)) {
        return ack({ ok: false, error: "Kata sandi salah." });
      }
    }

    const me: Member = { id: socket.id, name: userName };
    room.members.set(socket.id, me);
    socket.data.name = userName;
    socket.data.roomId = room.id;
    socket.join(room.id);

    console.log(`[room] ${userName} joined ${room.id} (${room.members.size} members)`);

    ack({ ok: true, data: { room: toRoomInfo(room), me } });
    io.to(room.id).emit("chat:message", systemMessage(room.id, `${userName} bergabung`));
    io.to(room.id).emit("room:updated", toRoomInfo(room));
    notifyRoomsChanged();
  });

  socket.on("chat:send", (input, ack) => {
    const reply = typeof ack === "function" ? ack : () => {};
    const roomId = socket.data.roomId;
    const room = roomId ? rooms.get(roomId) : undefined;
    const from = room?.members.get(socket.id);
    if (!room || !from) return reply({ ok: false, error: "Kamu belum berada di room." });

    const text = String(input?.text ?? "").trim();
    if (!text) return reply({ ok: false, error: "Pesan kosong." });
    if (text.length > LIMITS.message) {
      return reply({ ok: false, error: `Pesan maksimal ${LIMITS.message} karakter.` });
    }

    io.to(room.id).emit("chat:message", {
      id: randomUUID(),
      roomId: room.id,
      kind: "user",
      from,
      text,
      at: Date.now(),
    });
    reply({ ok: true, data: null });
  });

  socket.on("room:leave", (ack) => {
    leaveCurrentRoom(socket);
    if (typeof ack === "function") ack({ ok: true, data: null });
  });

  socket.on("disconnect", (reason) => {
    console.log(`[conn] ${socket.id} disconnected (${reason})`);
    leaveCurrentRoom(socket);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server on http://localhost:${PORT} (CORS: ${CORS_ORIGIN.join(", ")})`);
});
