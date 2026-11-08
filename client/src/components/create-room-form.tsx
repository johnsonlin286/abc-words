"use client";

import { useState } from "react";
import { LIMITS } from "@/shared/game";
import { useRoomStore } from "@/stores/room-store";

export default function CreateRoomForm() {
  const createRoom = useRoomStore((s) => s.createRoom);
  const pending = useRoomStore((s) => s.pending);
  const serverError = useRoomStore((s) => s.error);

  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPrivate && password.length < LIMITS.passwordMin) {
      return setLocalError(`Kata sandi wajib untuk room privat (min. ${LIMITS.passwordMin} karakter).`);
    }
    setLocalError(null);
    await createRoom({ isPrivate, password: isPrivate ? password : undefined });
  };

  const error = localError ?? serverError;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Jenis room</legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: false, label: "Publik", hint: "Siapa saja bisa join" },
            { value: true, label: "Privat", hint: "Pakai kata sandi" },
          ].map((opt) => (
            <label
              key={opt.label}
              className={`cursor-pointer rounded-md border px-3 py-2 text-sm transition-colors ${
                isPrivate === opt.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
                  : "border-zinc-300 dark:border-zinc-700"
              }`}
            >
              <input
                type="radio"
                name="visibility"
                className="sr-only"
                checked={isPrivate === opt.value}
                onChange={() => setIsPrivate(opt.value)}
              />
              <span className="block font-medium">{opt.label}</span>
              <span className="block text-xs text-zinc-500">{opt.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {isPrivate && (
        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Kata sandi <span className="text-red-500">*</span>
          </span>
          <input
            type="password"
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={LIMITS.passwordMin}
            maxLength={LIMITS.passwordMax}
            placeholder={`min. ${LIMITS.passwordMin} karakter`}
            required
          />
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Membuat room…" : "Buat room"}
      </button>
    </form>
  );
}
