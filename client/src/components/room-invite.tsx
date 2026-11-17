"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { buttonPrimary, errorText, hint, input, label, linkButton, notice } from "@/components/ui";
import FingerSum from "@/features/game/finger-sum";
import { getRoomSummary } from "@/lib/api";
import { isRoomCode, LIMITS, USER_NAME_HINT, USER_NAME_HTML_PATTERN, validateUserName } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";
import logo from "../../public/logo.png";
import { getRoomStatus, RoomStatusLabel, useLiveRoomData, VisibilityBadge } from "./room-list";

/** The invite for a visitor without a name yet; reads the code from the URL (needs Suspense). */
export function SignedOutInvite() {
  const { code } = useParams<{ code: string }>();
  return <RoomInvite code={code.toUpperCase()} />;
}

/**
 * What someone sees after opening an invite link (/room/[code]) without being in the room:
 * what this site is, who invited them, the room, and one form to pick a name and join.
 * Visitors who already have a name in this tab skip the name field.
 */
export default function RoomInvite({ code }: { code: string }) {
  const user = useAuthStore((s) => s.user);
  const sessionNotice = useAuthStore((s) => s.notice);
  const signIn = useRoomStore((s) => s.signIn);
  const joinRoom = useRoomStore((s) => s.joinRoom);
  const pending = useRoomStore((s) => s.pending);
  const serverError = useRoomStore((s) => s.error);
  const clearError = useRoomStore((s) => s.clearError);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const id = useId();

  useEffect(() => clearError(), [clearError]);
  useLiveRoomData();

  const validCode = isRoomCode(code);
  const summary = useQuery({
    queryKey: ["room-peek", code],
    queryFn: () => getRoomSummary(code),
    enabled: validCode,
    retry: false,
    staleTime: 0,
    // Visitors without a name aren't connected to the socket, so they miss "rooms:changed".
    // While the room can't be joined, look again now and then so the card opens up by itself.
    refetchInterval: (query) => (query.state.data && !getRoomStatus(query.state.data).joinable ? 5_000 : false),
  });
  const room = summary.data;
  const joinable = room ? getRoomStatus(room).joinable : false;
  const needsPassword = room?.hasPassword ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !joinable) return;
    const trimmed = name.trim();
    if (!user) {
      const nameError = validateUserName(trimmed);
      if (nameError) return setLocalError(nameError);
    }
    if (needsPassword && !password) return setLocalError("Kata sandi wajib diisi.");
    setLocalError(null);

    if (!user) {
      setSigningIn(true);
      try {
        await signIn(trimmed);
      } catch (err) {
        setSigningIn(false);
        return setLocalError(err instanceof Error ? err.message : "Gagal masuk, coba lagi.");
      }
    }
    // After signing in this card is replaced by the signed-in one, which shows the outcome.
    const ok = await joinRoom({ roomId: room.id, password: needsPassword ? password : undefined });
    if (!ok) summary.refetch(); // the room may have filled up or started meanwhile
  };

  /** Entrance: the invite line, the highlighter, the logo, then the rest; all done within ~1 s. */
  const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

  const busy = signingIn || pending;
  const error = localError ?? serverError;
  const host = room?.hostName;

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <section aria-labelledby={`${id}-title`} className="note-card flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-3">
          {/* The logo is the game's name, so it is part of the heading (as on the home page). */}
          <h1 id={`${id}-title`} className="flex flex-col gap-2 text-3xl leading-tight font-bold">
            <span className="ink-appear">
              {host ? (
                <>
                  <span className="relative isolate inline-block">
                    <span
                      aria-hidden
                      className="marker-sweep absolute -inset-x-1.5 top-[42%] bottom-0.5 -z-10 -rotate-1 rounded-[0.4em_0.2em_0.5em_0.25em] bg-highlight"
                      style={delay(180)}
                    />
                    <span className="break-all">{host}</span>
                  </span>{" "}
                  mengajakmu main
                </>
              ) : summary.isPending ? (
                // Holds the line while the room loads, so "Ayo main" doesn't flash before the host's name.
                <span className="invisible">Memuat undangan</span>
              ) : (
                "Ayo main"
              )}
            </span>
            <Image
              src={logo}
              alt="ABC Lima Dasar"
              sizes="18rem"
              loading="eager"
              fetchPriority="high"
              className="logo-stamp h-auto w-full max-w-72"
              style={delay(320)}
            />
          </h1>
          <p className="ink-appear leading-relaxed text-ink-soft" style={delay(560)}>
            Permainan kata legendaris era 90-an. Gratis, tidak perlu daftar.
          </p>
        </div>

        {/* The room */}
        {validCode ? (
          <div className="ink-appear rounded-xl border-2 border-dashed border-ink/40 bg-paper px-3.5 py-2.5" style={delay(640)}>
            {summary.isPending && <p className="text-ink-soft">Mencari room…</p>}
            {summary.isError && (
              <p className={errorText}>Room {code} tidak ditemukan atau sudah ditutup. Minta link baru ke temanmu.</p>
            )}
            {room && (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-soft">Room</p>
                  <p className="text-2xl leading-tight font-bold tracking-[0.2em] tabular-nums">{room.id}</p>
                  <p className="text-sm text-ink-soft">
                    {room.memberCount}/{room.maxMembers} pemain
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <VisibilityBadge isPrivate={room.hasPassword} />
                  <RoomStatusLabel room={room} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className={errorText}>Kode room tidak valid. Cek lagi link undangannya.</p>
        )}

        {room && !joinable && (
          <p className={notice}>
            {room.locked
              ? "Permainan di room ini sedang berjalan. Kamu bisa gabung setelah selesai; halaman ini ikut berubah sendiri."
              : "Room ini sudah penuh. Tunggu ada yang keluar, atau minta temanmu membuat room baru."}
          </p>
        )}

        {room && (
          <form onSubmit={handleSubmit} noValidate className="ink-appear flex flex-col gap-4" style={delay(720)}>
            {!user && sessionNotice && <p className={notice}>{sessionNotice}</p>}

            {user ? (
              <p className="text-ink-soft">
                Masuk sebagai <span className="font-bold text-ink">{user.name}</span>
              </p>
            ) : (
              <div className="space-y-1.5">
                <label htmlFor={`${id}-name`} className={label}>
                  Nama panggilanmu
                </label>
                <input
                  id={`${id}-name`}
                  className={input}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setLocalError(null);
                  }}
                  minLength={LIMITS.userNameMin}
                  maxLength={LIMITS.userName}
                  pattern={USER_NAME_HTML_PATTERN}
                  placeholder="budi_01"
                  autoComplete="nickname"
                  autoCapitalize="off"
                  spellCheck={false}
                  required
                  aria-describedby={`${id}-name-hint`}
                />
                <span id={`${id}-name-hint`} className={hint}>
                  {USER_NAME_HINT}. Tanpa email, tanpa kata sandi.
                </span>
              </div>
            )}

            {needsPassword && joinable && (
              <div className="space-y-1.5">
                <label htmlFor={`${id}-password`} className={label}>
                  Kata sandi room
                </label>
                <input
                  id={`${id}-password`}
                  type="password"
                  className={input}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError(null);
                  }}
                  maxLength={LIMITS.passwordMax}
                  autoComplete="off"
                  required
                />
                <span className={hint}>Tanyakan ke {host ?? "yang mengundangmu"}.</span>
              </div>
            )}

            {error && <p className={errorText}>{error}</p>}

            <button type="submit" disabled={!joinable || busy} className={`${buttonPrimary} py-3`}>
              {busy ? "Masuk…" : "Gabung ke room"}
              {!busy && <ArrowRight aria-hidden className="size-5" strokeWidth={2.75} />}
            </button>

            {!user && <p className="text-sm text-ink-faint">Namamu hanya tersimpan di tab ini dan hilang saat tab ditutup.</p>}
          </form>
        )}
      </section>

      <figure className="flex flex-col gap-4">
        <p className="w-fit -rotate-1 rounded-sm bg-highlight-soft px-2.5 font-hand text-lg">Cara mainnya</p>
        <FingerSum />
        <figcaption className="leading-relaxed text-ink-soft">
          Budi, Sari dan Andi menunjukkan 3, 5 dan 2 jari. Jumlahnya 10, jadi hurufnya J. Semua adu cepat menulis kata
          berawalan J, misalnya &ldquo;Jerapah&rdquo; untuk kategori Hewan. Pemain lain menilai jawabanmu, dan poin
          terbanyak menang.
        </figcaption>
        <Link href="/cara-main" className={`${linkButton} w-fit`}>
          Baca cara main lengkap
        </Link>
      </figure>

      <Link href="/" onClick={clearError} className={`${linkButton} w-fit text-sm text-ink-soft`}>
        Lihat beranda
      </Link>
    </div>
  );
}
