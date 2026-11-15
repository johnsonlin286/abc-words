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
              <s className="text-ink-faint decoration-redpen decoration-[3px]">{letter}</s>
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
