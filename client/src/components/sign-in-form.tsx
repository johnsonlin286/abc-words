"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
  LIMITS,
  USER_NAME_HINT,
  USER_NAME_HTML_PATTERN,
  validateUserName,
} from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";

export default function SignInForm() {
  const signInWithName = useRoomStore((s) => s.signIn);
  const notice = useAuthStore((s) => s.notice);
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const signIn = useMutation({
    mutationFn: signInWithName,
  });

  const trimmed = name.trim();
  const validationError = validateUserName(trimmed);
  const showValidation = touched && trimmed.length > 0 && validationError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!validationError) signIn.mutate(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-sm space-y-5 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div>
        <h1 className="text-xl font-semibold">ABC Words</h1>
        <p className="text-sm text-zinc-500">
          Main sebagai tamu — cukup isi nama, tanpa email atau kata sandi.
        </p>
      </div>

      {notice && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          {notice}
        </p>
      )}

      <label className="block space-y-1">
        <span className="text-sm font-medium">
          Nama <span className="text-red-500">*</span>
        </span>
        <input
          className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm ${
            showValidation ? "border-red-500" : "border-zinc-300 dark:border-zinc-700"
          }`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setTouched(true);
            signIn.reset();
          }}
          minLength={LIMITS.userNameMin}
          maxLength={LIMITS.userName}
          pattern={USER_NAME_HTML_PATTERN}
          placeholder="mis. budi_01"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          required
          aria-invalid={!!showValidation}
          aria-describedby="name-hint"
        />
        <span
          id="name-hint"
          className={`block text-xs ${showValidation ? "text-red-600" : "text-zinc-400"}`}
        >
          {showValidation ? validationError : USER_NAME_HINT}
        </span>
      </label>

      {signIn.isError && <p className="text-sm text-red-600">{signIn.error.message}</p>}

      <button
        type="submit"
        disabled={signIn.isPending || !!validationError}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {signIn.isPending ? "Masuk…" : "Masuk sebagai tamu"}
      </button>

      <p className="text-xs text-zinc-400">
        Sesi tersimpan di tab ini saja dan hilang saat tab ditutup.
      </p>
      <p className="text-sm">
        <Link href="/cara-main" className="text-blue-600 hover:underline">
          Belum tahu cara mainnya? Baca aturannya
        </Link>
      </p>
    </form>
  );
}
