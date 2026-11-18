"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TIP_WIDTH = 240;
const EDGE = 8;

/**
 * Small badge next to a player's name that explains itself when tapped
 * (works on touch screens, unlike a `title` tooltip). Escape, a tap elsewhere or scrolling closes it.
 * The tip is `position: fixed` under the badge and rendered into <body>: the score row scrolls and
 * fades its edges with a CSS mask, and a mask hides even fixed descendants. It is kept inside the screen.
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
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);
  const open = tip !== null;
  const wrapper = useRef<HTMLSpanElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      const target = e.target as Node;
      const inside = wrapper.current?.contains(target) || document.getElementById(tipId)?.contains(target);
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !inside) {
        setTip(null);
      }
    };
    // The tip is fixed to where the badge was; once anything scrolls it would float off.
    const hide = () => setTip(null);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [open, tipId]);

  return (
    <span ref={wrapper} className="relative inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        aria-label={label}
        onClick={(e) => {
          if (open) return setTip(null);
          const r = e.currentTarget.getBoundingClientRect();
          const width = Math.min(TIP_WIDTH, window.innerWidth - 2 * EDGE);
          const center = r.left + r.width / 2;
          const left = Math.min(Math.max(center - width / 2, EDGE), window.innerWidth - EDGE - width);
          setTip({ top: r.bottom + 8, left });
        }}
        className={`inline-flex items-center gap-1 rounded px-0.5 text-xs leading-none font-medium tabular-nums focus-visible:outline-3 focus-visible:outline-redpen ${className}`}
      >
        {children}
      </button>
      {tip &&
        createPortal(
          <span
            id={tipId}
            role="tooltip"
            style={{ top: tip.top, left: tip.left, width: Math.min(TIP_WIDTH, window.innerWidth - 2 * EDGE) }}
            className="fixed z-30 rounded-xl border-2 border-ink bg-white px-3 py-2 text-xs leading-snug font-medium text-ink shadow-[3px_3px_0_var(--color-ink)]"
          >
            {explanation}
          </span>,
          document.body,
        )}
    </span>
  );
}
