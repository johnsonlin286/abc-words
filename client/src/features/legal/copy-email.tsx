"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { copyText } from "@/lib/clipboard";

/**
 * The contact address with a copy button beside it: a `mailto:` link does nothing on a computer
 * without a mail app, so the address can always be pasted into webmail instead.
 */
export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!(await copyText(email))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <span className="inline-flex items-center gap-1 align-middle">
      <span className="font-semibold break-all text-ink">{email}</span>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={copied ? "Alamat email tersalin" : `Salin ${email}`}
        title={copied ? "Tersalin" : "Salin"}
        className="inline-grid size-8 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-highlight-soft hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen"
      >
        {copied ? (
          <Check aria-hidden className="size-4 text-success" strokeWidth={3} />
        ) : (
          <Copy aria-hidden className="size-4" strokeWidth={2.5} />
        )}
      </button>
      <span aria-live="polite" className={`text-sm font-semibold text-success ${copied ? "" : "sr-only"}`}>
        {copied ? "Tersalin!" : ""}
      </span>
    </span>
  );
}
