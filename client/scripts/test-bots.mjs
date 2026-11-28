#!/usr/bin/env node
// Guest bots for playtesting a room by hand (dev only). They join, press "Siap" and play every round.
//
//   npm --prefix client run bots -- [scenario] [count] [ROOM]
//
// Without ROOM the bots join the newest public room that hasn't started (create it in the app first);
// a private room needs its code and has no password support here.
//
// Scenarios:
//   normal    answer a listed country (verified, passes), keep the letter, finish judging. Default.
//   unranked  like normal, and reject every unverified answer of the others, so a player who never
//             gives a listed answer ends without an accepted answer: no rank and the "no ranking"
//             jingle on the final scores. Category Negara, and answer a word that isn't a country.
//
// Env: BACKEND_URL (default http://localhost:3001), JUDGE_MS (how long the bots take to judge, default 1500).

import { io } from "socket.io-client";

const COUNTRIES = {
  A: ["Austria", "Albania", "Angola"],
  B: ["Belgia", "Brasil", "Bolivia"],
  C: ["Cile", "Ceko", "Chad"],
  D: ["Denmark", "Dominika"],
  E: ["Ekuador", "Estonia", "Eritrea"],
  F: ["Fiji", "Finlandia", "Filipina"],
  G: ["Gabon", "Ghana", "Guatemala"],
  H: ["Haiti", "Honduras", "Hungaria"],
  I: ["Irak", "Iran", "Irlandia"],
  J: ["Jepang", "Jerman", "Jamaika"],
  K: ["Kanada", "Kenya", "Kuba"],
  L: ["Laos", "Latvia", "Libya"],
  M: ["Mali", "Meksiko", "Malta"],
  N: ["Nepal", "Nigeria", "Norwegia"],
  O: ["Oman"],
  P: ["Peru", "Panama", "Portugal"],
  Q: ["Qatar"],
  R: ["Rusia", "Rwanda", "Rumania"],
  S: ["Suriah", "Swedia", "Senegal"],
  T: ["Togo", "Tunisia", "Thailand"],
  U: ["Uganda", "Ukraina", "Uruguay"],
  V: ["Vietnam", "Vanuatu", "Venezuela"],
  Y: ["Yaman", "Yordania", "Yunani"],
  Z: ["Zambia", "Zimbabwe"],
};
const NAMES = ["Sinta", "Raka", "Dewi", "Bima", "Tari", "Yoga", "Nina"];

const SCENARIOS = ["normal", "unranked"];
const args = process.argv.slice(2);
const scenario = args.find((a) => SCENARIOS.includes(a)) ?? "normal";
const count = Math.min(Math.max(Number(args.find((a) => /^\d+$/.test(a))) || 2, 1), NAMES.length);
const codeArg = args.find((a) => !SCENARIOS.includes(a) && !/^\d+$/.test(a));
const url = process.env.BACKEND_URL ?? "http://localhost:3001";

/** The newest public room still in its waiting room, with seats for the bots. */
async function findRoom() {
  const res = await fetch(`${url}/api/abc-words/rooms`).catch(() => null);
  if (!res?.ok) return null;
  const { data } = await res.json();
  const open = data
    .filter((r) => !r.locked && !r.hasPassword && r.memberCount + count <= r.maxMembers)
    .sort((a, b) => b.createdAt - a.createdAt);
  return open[0]?.id ?? null;
}

const roomId = codeArg?.toUpperCase() ?? (await findRoom());
if (!roomId) {
  console.error(
    codeArg === undefined
      ? `Tidak ada room publik yang menunggu di ${url}. Buat room di app dulu, lalu jalankan lagi.`
      : "Usage: npm --prefix client run bots -- [normal|unranked] [count] [ROOM]",
  );
  process.exit(1);
}

/** Names the bots play under, so they never reject each other. */
const botNames = new Set();

function startBot(base, index) {
  let name = base;
  let tries = 1;
  botNames.add(name);
  const socket = io(url, { auth: { name }, transports: ["websocket"] });
  const act = (action, payload) => socket.emitWithAck("room:action", { action, ...(payload && { payload }) });
  const log = (...args) => console.log(`[${name}]`, ...args);
  let last = "";
  /** Seen a game since the last waiting room. */
  let played = false;

  socket.on("room:state", ({ state }) => {
    const key = `${state.round}:${state.phase}`;
    if (key === last) return;
    last = key;
    log(`ronde ${state.round}: ${state.phase}`);

    // Readiness resets after every game: be ready for the next one.
    if (state.phase === "waiting" && played) void act("ready", { ready: true });
    played = state.phase !== "waiting";
    if (state.phase === "picking") setTimeout(() => void act("pick", { value: 3 + index }), 800 + index * 300);
    if (state.phase === "reveal") void act("changeLetter", { choice: "keep" });
    if (state.phase === "answering") {
      // Each bot takes a different country, so they don't collide.
      setTimeout(async () => {
        const letter = state.reveal.letter;
        const text = COUNTRIES[letter]?.[index] ?? `${letter}abulia`;
        const res = await act("answer", { text });
        log("jawab", text, res.ok ? res.data.status : res.error?.code);
      }, 1500 + index * 400);
    }
    if (state.phase === "voting") {
      setTimeout(async () => {
        if (scenario === "unranked") {
          for (const a of state.answers.filter((x) => !x.verified && !botNames.has(x.name))) {
            const res = await act("reject", { answerUserId: a.userId, rejected: true, reason: "not-a-word" });
            log("tolak", a.name, a.text, res.ok ? "ok" : res.error?.code);
          }
        }
        await act("doneVoting", { done: true });
      }, Number(process.env.JUDGE_MS ?? 1500));
    }
  });

  socket.on("connect_error", (err) => {
    // A bot from an earlier run may still hold the name for a while: take "Sinta2" and so on.
    if (err.message === "NAME_TAKEN" && tries < 9) {
      tries += 1;
      botNames.delete(name);
      name = `${base}${tries}`;
      botNames.add(name);
      socket.auth = { name };
      socket.connect();
      return;
    }
    log("gagal terhubung:", err.message);
  });
  socket.once("session", async () => {
    const joined = await socket.emitWithAck("room:join", { roomId });
    if (!joined.ok) {
      log("gagal masuk room:", joined.error?.message ?? joined.error?.code);
      socket.close();
      return;
    }
    await act("ready", { ready: true });
    log("masuk dan siap");
  });
  return socket;
}

console.log(`${count} bot masuk ke room ${roomId} (${scenario}) lewat ${url}. Ctrl+C untuk berhenti.`);
if (scenario === "unranked")
  console.log("Jawab kata yang bukan nama negara (atau jangan menjawab): bot akan menolaknya.");
const sockets = NAMES.slice(0, count).map(startBot);
process.on("SIGINT", () => {
  for (const s of sockets) s.close();
  process.exit(0);
});
