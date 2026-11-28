"use client";

import { useEffect, useRef, useState } from "react";
import { rankPlayers } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import type { GameRoomView } from "@/stores/room-store";
import { AfkBadge, isAfk } from "./afk";

/**
 * Running score on one row above the game, however many players there are: your own score
 * is always first, everyone else follows by rank. When the row doesn't fit it scrolls sideways
 * and fades at the edge that has more.
 */
export default function ScoreStrip({ room }: { room: GameRoomView }) {
  const myId = useAuthStore((s) => s.user?.userId);
  const row = useRef<HTMLUListElement>(null);
  const [more, setMore] = useState({ left: false, right: false });

  const ranking = rankPlayers(room.members, room.state.scores, room.state.speed);
  const players = [...ranking.filter((p) => p.userId === myId), ...ranking.filter((p) => p.userId !== myId)];

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const update = () =>
      setMore({ left: el.scrollLeft > 1, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [players.length]);

  const fade = `${more.left ? "transparent, #000 1.5rem" : "#000"}, ${more.right ? "#000 calc(100% - 2.5rem), transparent" : "#000"}`;

  return (
    <ul
      ref={row}
      aria-label="Skor sementara"
      style={{ maskImage: `linear-gradient(to right, ${fade})` }}
      className="-mx-1 flex [scrollbar-width:none] gap-2 overflow-x-auto px-1 py-1 text-sm [&::-webkit-scrollbar]:hidden"
    >
      {players.map((p) => {
        const isMe = p.userId === myId;
        return (
          <li
            key={p.userId}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 font-semibold ${
              isMe ? "bg-highlight-soft" : "bg-white"
            }`}
          >
            {isMe && (
              <span className="text-xs font-bold text-ink-soft tabular-nums">
                <span className="sr-only">Kamu, peringkat </span>#{p.rank}
              </span>
            )}
            <span title={p.name} className="max-w-28 truncate">
              {p.name}
            </span>
            {isAfk(room.state, p.userId) && <AfkBadge name={p.name} />}
            <span className="rounded-full bg-highlight px-1.5 font-bold tabular-nums">{p.score}</span>
          </li>
        );
      })}
    </ul>
  );
}
