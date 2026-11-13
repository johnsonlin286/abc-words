"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Small badge next to a player's name that explains itself when tapped
 * (works on touch screens, unlike a `title` tooltip). Escape or a tap elsewhere closes it.
 */
export default function InfoBadge({
  label,
  children,
  explanation,
  className = "",
}: {
  /** Accessible name of the button, e.g. "Peringatan Andi: 2/3". */
  label: string;
  /** What the badge shows. */
  children: React.ReactNode;
  explanation: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !wrapper.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <span ref={wrapper} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 rounded px-0.5 text-xs leading-none font-medium tabular-nums focus-visible:outline-2 focus-visible:outline-chalk-yellow ${className}`}
      >
        {children}
      </button>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="absolute top-full left-1/2 z-10 mt-2 w-60 -translate-x-1/2 rounded-md border border-chalk-yellow/60 bg-board-deep px-3 py-2 text-xs leading-snug font-normal text-chalk shadow-lg"
        >
          {explanation}
        </span>
      )}
    </span>
  );
}
