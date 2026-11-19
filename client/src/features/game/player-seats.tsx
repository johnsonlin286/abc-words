"use client";

import { BellRing, Check, Crown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buttonPrimary, buttonSecondary, errorText } from "@/components/ui";
import type { MemberView } from "@/shared/contract";
import { PING_COOLDOWN_MS } from "@/shared/game";
import { useRoomStore } from "@/stores/room-store";

type Props = {
  members: MemberView[];
  maxMembers: number;
  hostId: string;
  myId: string;
  /** Players who pressed "Siap"; the host counts as ready. */
  ready: string[];
};

const iconButton =
  "grid size-7 shrink-0 place-items-center rounded-lg border-2 border-ink bg-white text-ink hover:bg-highlight-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen disabled:cursor-not-allowed disabled:border-ink/25 disabled:text-ink-faint disabled:hover:bg-white";

/**
 * Waiting-room seats with each player's "Siap" status. The host also gets a bell to call a player
 * who isn't ready (once per `PING_COOLDOWN_MS`) and a cross to remove a player, after a confirmation.
 */
export default function PlayerSeats({ members, maxMembers, hostId, myId, ready }: Props) {
  const emptySeats = Math.max(maxMembers - members.length, 0);
  const iAmHost = myId === hostId;
  const pingPlayer = useRoomStore((s) => s.pingPlayer);
  const [error, setError] = useState<string | null>(null);
  /** Players called in the last `PING_COOLDOWN_MS`, so their bell greys out (the server enforces it too). */
  const [cooling, setCooling] = useState<string[]>([]);
  const [kicking, setKicking] = useState<MemberView | null>(null);

  const ping = async (m: MemberView) => {
    const message = await pingPlayer(m.userId);
    setError(message);
    if (message) return;
    setCooling((c) => [...c, m.userId]);
    setTimeout(() => setCooling((c) => c.filter((id) => id !== m.userId)), PING_COOLDOWN_MS);
  };

  return (
    <section aria-labelledby="players-heading">
      <h2 id="players-heading" className="text-xl font-bold">
        Pemain <span className="text-ink-faint tabular-nums">{members.length}/{maxMembers}</span>
      </h2>
      <ul className="mt-3 grid grid-cols-2 gap-2">
        {members.map((m) => {
          const isMe = m.userId === myId;
          const isHost = m.userId === hostId;
          const isReady = isHost || ready.includes(m.userId);
          const justCalled = cooling.includes(m.userId);
          return (
            <li
              key={m.userId}
              className={`relative flex min-w-0 flex-col gap-1.5 rounded-xl border-2 px-3 py-2 text-sm font-semibold ${
                isMe ? "border-ink bg-highlight-soft" : "border-ink bg-white"
              } ${m.isConnected ? "" : "border-ink/30 text-ink-faint"}`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${m.isConnected ? "bg-success" : "bg-ink-faint/50"}`}
                  title={m.isConnected ? "Online" : "Terputus, menunggu tersambung lagi"}
                />
                {/* Names have no spaces, so allow breaking anywhere rather than cutting them off. */}
                <span className="min-w-0 flex-1 break-all">
                  {m.name}
                  {isMe && <span className="sr-only"> (kamu)</span>}
                </span>
              </div>

              <div className="flex min-h-7 flex-wrap items-center justify-between gap-x-2 gap-y-1 whitespace-nowrap">
                {isHost ? (
                  <span className="text-xs font-semibold text-ink-soft">Host</span>
                ) : isReady ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                    <Check aria-hidden className="size-3.5" strokeWidth={3.5} />
                    Siap
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-ink-faint">Belum siap</span>
                )}
                {iAmHost && !isHost && (
                  <span className="ml-auto flex gap-1">
                    {!isReady && m.isConnected && (
                      <button
                        type="button"
                        aria-label={justCalled ? `${m.name} baru dipanggil` : `Panggil ${m.name}`}
                        title={justCalled ? `Bisa dipanggil lagi setelah ${PING_COOLDOWN_MS / 1000} detik` : "Panggil"}
                        disabled={justCalled}
                        onClick={() => ping(m)}
                        className={iconButton}
                      >
                        <BellRing aria-hidden className="size-3.5" strokeWidth={2.5} />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label={`Keluarkan ${m.name}`}
                      title="Keluarkan"
                      onClick={() => setKicking(m)}
                      className={`${iconButton} text-redpen`}
                    >
                      <X aria-hidden className="size-3.5" strokeWidth={3} />
                    </button>
                  </span>
                )}
              </div>

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
      {error && <p className={`${errorText} mt-2`}>{error}</p>}
      <KickDialog member={kicking} onClose={() => setKicking(null)} />
    </section>
  );
}

/** "Keluarkan X?": the player can join again, so this is a nudge rather than a ban. */
function KickDialog({ member, onClose }: { member: MemberView | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const kickPlayer = useRoomStore((s) => s.kickPlayer);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (member && !d.open) {
      setError(null);
      d.showModal();
    }
    if (!member && d.open) d.close();
  }, [member]);

  const confirm = async () => {
    if (!member) return;
    setBusy(true);
    const message = await kickPlayer(member.userId);
    setBusy(false);
    setError(message);
    if (!message) onClose();
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="kick-title"
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="paper m-auto w-[calc(100%-1.5rem)] max-w-md rounded-2xl border-2 border-ink p-0 text-ink shadow-[5px_5px_0_var(--color-ink)] backdrop:bg-ink/50"
    >
      <div className="flex flex-col gap-4 py-6 pr-5 pl-10 sm:pr-8 sm:pl-14">
        <h2 id="kick-title" className="text-2xl font-bold break-all">
          Keluarkan {member?.name}?
        </h2>
        <p className="font-medium text-ink-soft">Dia dikeluarkan dari room ini, tapi masih bisa masuk lagi lewat link.</p>
        {error && <p className={errorText}>{error}</p>}
        <div className="flex flex-wrap gap-3 pt-1">
          <button type="button" onClick={onClose} className={buttonPrimary}>
            Batal
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className={`${buttonSecondary} border-redpen text-redpen hover:bg-white`}
          >
            Ya, keluarkan
          </button>
        </div>
      </div>
    </dialog>
  );
}
