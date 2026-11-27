"use client";

import { useCallback, useEffect, useRef } from "react";

/** Paper left visible above (or below) what is brought into view. */
const MARGIN = 8;
/** Room kept free under what is brought into view: the chat button floats in the bottom corner. */
const CHAT_BUTTON_ROOM = 88;
/** Time for a new phase to be laid out before scrolling to it. */
const SETTLE_MS = 80;

function behavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function pageTop(element: Element): number {
  return element.getBoundingClientRect().top + window.scrollY;
}

/**
 * Phones (same as the app's use-focus-game-card.ts): each new game phase, or a change in `key`
 * generally, brings the game area (the score row with the card under it) to the top of the screen,
 * so the players and the controls are in view without scrolling; the room code and letters stay a
 * scroll away. `null` (the waiting room) goes back to the top of the page. Off when `enabled` is false.
 */
export function useFocusGameArea(key: string | null, enabled: boolean) {
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      const area = areaRef.current;
      const top = key === null || !area ? 0 : Math.max(pageTop(area) - MARGIN, 0);
      window.scrollTo({ top, behavior: behavior() });
    }, SETTLE_MS);
    return () => clearTimeout(timer);
  }, [key, enabled]);

  /** Scrolls past the top of the game area only as far as needed to show `target` (inside it) whole. */
  const showInArea = useCallback(
    (target: HTMLElement | null) => {
      const area = areaRef.current;
      if (!enabled || !target || !area) return;
      const needed = target.getBoundingClientRect().bottom + window.scrollY + CHAT_BUTTON_ROOM - window.innerHeight;
      window.scrollTo({ top: Math.max(pageTop(area) - MARGIN, needed, 0), behavior: behavior() });
    },
    [enabled],
  );

  return { areaRef, showInArea };
}
