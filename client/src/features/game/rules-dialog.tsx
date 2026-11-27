"use client";

import { BookOpen, X } from "lucide-react";
import { useRef } from "react";
import { buttonPrimary } from "@/components/ui";
import FullRules from "@/features/how-to-play/full-rules";

/** "Cara Main" button that opens every rule (folded, as in the app) on a notebook sheet without leaving the room. */
export default function RulesDialog({ className }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className={className} onClick={() => dialog.current?.showModal()}>
        <BookOpen aria-hidden className="size-4" strokeWidth={2.5} />
        Cara Main
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="rules-dialog-title"
        // Clicking the backdrop (the dialog element itself) closes it.
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="paper m-auto max-h-[88vh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl border-2 border-ink p-0 text-ink shadow-[5px_5px_0_var(--color-ink)] backdrop:bg-ink/50"
      >
        <div className="relative flex flex-col gap-8 py-6 pr-5 pl-10 sm:py-8 sm:pr-8 sm:pl-20">
          {/* First focusable element, so the dialog opens scrolled to the top. */}
          <button
            type="button"
            aria-label="Tutup cara main"
            onClick={() => dialog.current?.close()}
            className="absolute top-4 right-4 grid size-9 place-items-center rounded-full border-2 border-ink bg-white hover:bg-highlight-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen"
          >
            <X aria-hidden className="size-5" strokeWidth={2.75} />
          </button>
          <h2 id="rules-dialog-title" className="pr-12 text-4xl font-bold">
            <span className="relative isolate inline-block">
              <span
                aria-hidden
                className="absolute -inset-x-2 top-[42%] bottom-1 -z-10 -rotate-1 rounded-[0.4em_0.2em_0.5em_0.25em] bg-highlight"
              />
              Aturan lengkap
            </span>
          </h2>
          <p className="-mt-4 text-lg text-ink-soft">Ketuk setiap langkah untuk membaca detailnya.</p>
          <FullRules headingLevel={3} />
          <button type="button" onClick={() => dialog.current?.close()} className={`${buttonPrimary} self-start px-6`}>
            Tutup
          </button>
        </div>
      </dialog>
    </>
  );
}
