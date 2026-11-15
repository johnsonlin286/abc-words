"use client";

import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";
import { buttonPrimary, errorText, hint, input, label, notice as noticeClass } from "@/components/ui";
import { LIMITS, USER_NAME_HINT, USER_NAME_HTML_PATTERN, validateUserName } from "@/shared/game";
import { useAuthStore } from "@/stores/auth-store";
import { useRoomStore } from "@/stores/room-store";

type Props = {
  /** Focused from outside, e.g. when a visitor picks a room before having a name. */
  ref?: React.Ref<HTMLInputElement>;
  title?: string;
  /** Context shown above the field (why we're asking now). */
  message?: string | null;
  autoFocus?: boolean;
};

/** Guest sign-in: a name is all it takes. */
export default function SignInForm({ ref, title = "Mulai main", message = null, autoFocus = false }: Props) {
  const signInWithName = useRoomStore((s) => s.signIn);
  const sessionNotice = useAuthStore((s) => s.notice);
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const hintId = useId();

  const signIn = useMutation({ mutationFn: signInWithName });

  const trimmed = name.trim();
  const validationError = validateUserName(trimmed);
  const showValidation = touched && trimmed.length > 0 && validationError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!validationError) signIn.mutate(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="note-card flex w-full max-w-md flex-col gap-4 p-5 sm:p-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-ink-soft">Main sebagai tamu: tanpa email, tanpa kata sandi.</p>
      </div>

      {(message ?? sessionNotice) && <p className={noticeClass}>{message ?? sessionNotice}</p>}

      <div className="space-y-1.5">
        <label htmlFor={`${hintId}-name`} className={label}>
          Nama panggilan
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1 space-y-1.5">
            <input
              ref={ref}
              id={`${hintId}-name`}
              className={input}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setTouched(true);
                signIn.reset();
              }}
              minLength={LIMITS.userNameMin}
              maxLength={LIMITS.userName}
              pattern={USER_NAME_HTML_PATTERN}
              placeholder="budi_01"
              autoComplete="nickname"
              autoCapitalize="off"
              spellCheck={false}
              autoFocus={autoFocus}
              required
              aria-invalid={!!showValidation}
              aria-describedby={hintId}
            />
            <span id={hintId} className={showValidation ? `block ${errorText}` : hint}>
              {showValidation ? validationError : `${USER_NAME_HINT}.`}
            </span>
          </div>
          <button type="submit" disabled={signIn.isPending} className={`${buttonPrimary} shrink-0`}>
            {signIn.isPending ? "Masuk…" : "Masuk"}
          </button>
        </div>
      </div>

      {signIn.isError && <p className={errorText}>{signIn.error.message}</p>}

      <p className="text-sm text-ink-faint">Namamu hanya tersimpan di tab ini dan hilang saat tab ditutup.</p>
    </form>
  );
}
