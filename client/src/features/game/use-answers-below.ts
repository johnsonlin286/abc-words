"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** A row counts as seen once this much of its bottom edge, at most, is still below the screen. */
const TOLERANCE = 4;
/** "Lihat N Lagi" moves down this share of the screen, so the last answers seen stay in view. */
const STEP = 0.75;
/** Paper left under the last answer after the final step. */
const MARGIN = 8;

/**
 * Voting (same as the app): how many answers are still below the screen (above the footer of
 * `footerHeight`), and whether the player has seen the last one this round. `round` is set while
 * voting, else null.
 */
export function useAnswersBelow(round: string | null, footerHeight: number) {
  const listRef = useRef<HTMLOListElement>(null);
  const [below, setBelow] = useState(0);
  /** The voting round in which the last answer has been on screen. */
  const [seenIn, setSeenIn] = useState<string | null>(null);

  const bottomOfView = useCallback(() => window.innerHeight - footerHeight, [footerHeight]);

  useEffect(() => {
    if (round === null) return;
    const update = () => {
      const rows = listRef.current?.children;
      if (!rows || rows.length === 0) return;
      const bottom = bottomOfView();
      let count = 0;
      for (const row of rows) if (row.getBoundingClientRect().bottom > bottom + TOLERANCE) count += 1;
      setBelow(count);
      if (count === 0) setSeenIn(round);
    };
    update();
    // Rows can grow (reasons opened, rejections added) as well as move.
    const observer = new ResizeObserver(update);
    if (listRef.current) observer.observe(listRef.current);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [round, bottomOfView]);

  /** Scrolls on to the next answers, ending with the last one just above the footer. */
  const showMore = useCallback(() => {
    const last = listRef.current?.lastElementChild;
    if (!last) return;
    const view = bottomOfView();
    const toLast = last.getBoundingClientRect().bottom + MARGIN - view;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: Math.max(Math.min(view * STEP, toLast), 0), behavior: smooth ? "smooth" : "auto" });
  }, [bottomOfView]);

  const seenAll = round !== null && seenIn === round;
  return { listRef, below: round === null || seenAll ? 0 : below, showMore };
}
