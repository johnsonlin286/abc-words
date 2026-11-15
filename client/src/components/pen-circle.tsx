/**
 * The teacher's hand-drawn red loop around a letter. Place it inside a `relative` element.
 * The path length is normalised to 1, so it can be drawn in by animating stroke-dashoffset
 * (`draw` uses the `.pen-draw` animation in globals.css; `delayMs` waits before drawing).
 */
export default function PenCircle({
  draw = false,
  delayMs = 0,
  anim,
  className = "-inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)]",
}: {
  draw?: boolean;
  delayMs?: number;
  /** `data-anim` hook for the home page's GSAP intro. */
  anim?: string;
  /** Position and size around the letter; bigger letters need more room. */
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 120 110"
      className={`pointer-events-none absolute overflow-visible ${className}`}
    >
      <path
        data-anim={anim}
        className={draw ? "pen-draw" : undefined}
        style={draw ? { animationDelay: `${delayMs}ms` } : undefined}
        pathLength={1}
        strokeDasharray="1"
        d="M92 18C74 4 34 6 18 30C3 53 12 88 46 98C80 108 112 88 110 54C108 30 92 14 66 12"
        fill="none"
        stroke="var(--color-redpen)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
