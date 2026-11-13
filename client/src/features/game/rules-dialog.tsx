"use client";

import { useRef } from "react";
import HowToPlay from "./how-to-play";

/** "Cara main" button that opens the rules without leaving the room. */
export default function RulesDialog({ className }: { className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className={className} onClick={() => dialog.current?.showModal()}>
        Cara main
      </button>
      <dialog
        ref={dialog}
        aria-label="Cara main"
        // Clicking the backdrop (the dialog element itself) closes it.
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl bg-board p-0 backdrop:bg-black/60"
      >
        <div className="relative space-y-5 p-5 sm:p-7">
          {/* First focusable element, so the dialog opens scrolled to the top. */}
          <button
            type="button"
            aria-label="Tutup cara main"
            onClick={() => dialog.current?.close()}
            className="absolute top-4 right-4 rounded-md px-2 py-1 text-xl leading-none text-chalk-dim hover:text-chalk focus-visible:outline-2 focus-visible:outline-chalk-yellow"
          >
            ✕
          </button>
          <HowToPlay headingLevel={2} />
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="rounded-md bg-chalk-yellow px-5 py-2 font-medium text-board-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk"
          >
            Tutup
          </button>
        </div>
      </dialog>
    </>
  );
}
