import { Crown } from "lucide-react";
import type { MemberView } from "@/shared/contract";

type Props = {
  members: MemberView[];
  maxMembers: number;
  hostId: string;
  myId: string;
};

export default function PlayerSeats({ members, maxMembers, hostId, myId }: Props) {
  const emptySeats = Math.max(maxMembers - members.length, 0);

  return (
    <section aria-labelledby="players-heading">
      <h2 id="players-heading" className="text-xl font-bold">
        Pemain <span className="text-ink-faint tabular-nums">{members.length}/{maxMembers}</span>
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {members.map((m) => {
          const isMe = m.userId === myId;
          const isHost = m.userId === hostId;
          return (
            <li
              key={m.userId}
              className={`relative flex min-w-0 items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-semibold ${
                isMe ? "border-ink bg-highlight-soft" : "border-ink bg-white"
              } ${m.isConnected ? "" : "border-ink/30 text-ink-faint"}`}
            >
              <span
                className={`size-2.5 shrink-0 rounded-full ${m.isConnected ? "bg-success" : "bg-ink-faint/50"}`}
                title={m.isConnected ? "Online" : "Terputus, menunggu tersambung lagi"}
              />
              {/* Names have no spaces, so allow breaking anywhere rather than cutting them off. */}
              <span className="min-w-0 flex-1 break-all">
                {m.name}
                {isMe && <span className="sr-only"> (kamu)</span>}
              </span>
              {/* Floats on the seat's corner so the name keeps the full width. */}
              {isHost && (
                <span title="Host" className="absolute -top-2.5 -right-1.5 rounded-full border-2 border-ink bg-highlight p-0.5">
                  <Crown aria-label="Host" className="size-3.5 fill-white text-ink" strokeWidth={2.5} />
                </span>
              )}
            </li>
          );
        })}
        {Array.from({ length: emptySeats }, (_, i) => (
          <li key={i} className="rounded-xl border-2 border-dashed border-ink/25 px-3 py-2 text-sm font-medium text-ink-faint">
            Bangku kosong
          </li>
        ))}
      </ul>
    </section>
  );
}
