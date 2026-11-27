"use client";

import { useState } from "react";
import { buttonPrimary, errorText, input, label } from "@/components/ui";
import { LIMITS } from "@/shared/game";
import { useRoomStore } from "@/stores/room-store";

const VISIBILITY = [
  { value: false, label: "Publik", hint: "Muncul di daftar, siapa saja bisa gabung" },
  { value: true, label: "Privat", hint: "Hanya yang tahu kata sandinya" },
];

export default function CreateRoomForm() {
  const createRoom = useRoomStore((s) => s.createRoom);
  const pending = useRoomStore((s) => s.pending);
  const serverError = useRoomStore((s) => s.error);
  const online = useRoomStore((s) => s.connection === "online");

  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPrivate && password.length < LIMITS.passwordMin) {
      return setLocalError(`Room privat butuh kata sandi minimal ${LIMITS.passwordMin} karakter.`);
    }
    setLocalError(null);
    await createRoom({ isPrivate, password: isPrivate ? password : undefined });
  };

  const error = localError ?? serverError;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <fieldset className="space-y-2">
        <legend className={`${label} mb-2`}>Siapa yang boleh gabung?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {VISIBILITY.map((opt) => {
            const selected = isPrivate === opt.value;
            return (
              <label
                key={opt.label}
                className={`flex cursor-pointer flex-col rounded-xl border-2 px-3.5 py-2.5 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-redpen ${
                  selected ? "border-ink bg-highlight-soft" : "border-ink/30 bg-white hover:border-ink"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  className="sr-only"
                  checked={selected}
                  onChange={() => setIsPrivate(opt.value)}
                />
                <span className="font-bold">{opt.label}</span>
                <span className="text-sm text-ink-soft">{opt.hint}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {isPrivate && (
        <div className="space-y-1.5">
          <label htmlFor="create-password" className={label}>
            Kata sandi room
          </label>
          <input
            id="create-password"
            type="password"
            className={input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={LIMITS.passwordMin}
            maxLength={LIMITS.passwordMax}
            placeholder={`Minimal ${LIMITS.passwordMin} karakter`}
            required
          />
        </div>
      )}

      {error && <p className={errorText}>{error}</p>}

      <button type="submit" disabled={pending || !online} className={buttonPrimary}>
        {pending ? "Membuat room…" : "Buat room"}
      </button>
    </form>
  );
}
