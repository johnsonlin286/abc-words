const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

/** The 26 letters of the game; letters already drawn are crossed out in red pen. */
export default function AlphabetStrip({ used }: { used: string[] }) {
  return (
    <div>
      <ol
        aria-label="Huruf A sampai Z"
        className="grid grid-cols-13 gap-y-1 text-center text-2xl leading-8 font-bold sm:grid-cols-[repeat(26,minmax(0,1fr))] sm:text-[1.6rem]"
      >
        {LETTERS.map((letter) => (
          <li key={letter}>
            {used.includes(letter) ? (
              <span className="relative inline-block text-ink-faint">
                {letter}
                <span className="sr-only"> (sudah keluar)</span>
                {/* A diagonal red-pen stroke, bottom-left to top-right, a little past the letter. */}
                <svg
                  aria-hidden
                  viewBox="0 0 10 10"
                  preserveAspectRatio="none"
                  className="pointer-events-none absolute -inset-x-1 inset-y-0.5 h-[calc(100%-0.25rem)] w-[calc(100%+0.5rem)] overflow-visible"
                >
                  <path d="M1 9.2 Q5 5.4 9 0.8" fill="none" stroke="var(--color-redpen)" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                </svg>
              </span>
            ) : (
              letter
            )}
          </li>
        ))}
      </ol>
      <p className="mt-1 text-xs font-medium text-ink-soft">Huruf yang sudah keluar dicoret di sini.</p>
    </div>
  );
}
