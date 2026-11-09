import type { MemberView } from "@/shared/contract";
import { chalkFont } from "./fonts";

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
      <h2 id="players-heading" className={`${chalkFont.className} text-2xl text-chalk`}>
        Pemain {members.length}/{maxMembers}
      </h2>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {members.map((m) => (
          <li
            key={m.userId}
            className="relative flex min-w-0 items-center gap-2 rounded-md bg-board-deep px-3 py-2 text-sm text-chalk"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${m.isConnected ? "bg-chalk-yellow" : "bg-chalk-dim/40"}`}
              title={m.isConnected ? "Online" : "Terputus, menunggu tersambung lagi"}
            />
            {/* Names have no spaces, so allow breaking anywhere rather than cutting them off. */}
            <span className={`min-w-0 break-all ${m.isConnected ? "" : "text-chalk-dim"}`}>{m.name}</span>
            {/* Badges sit on the seat's corner so the name keeps the full width. */}
            <span className="absolute -top-2 right-1 flex gap-0.5 text-sm leading-none">
              {m.userId === myId && (
                <span role="img" aria-label="Kamu" title="Kamu">
                  🙋
                </span>
              )}
              {m.userId === hostId && (
                <span role="img" aria-label="Host" title="Host">
                  👑
                </span>
              )}
            </span>
          </li>
        ))}
        {Array.from({ length: emptySeats }, (_, i) => (
          <li
            key={i}
            className="rounded-md border border-dashed border-chalk-dim/40 px-3 py-2 text-sm text-chalk-dim"
          >
            Kursi kosong
          </li>
        ))}
      </ul>
    </section>
  );
}
