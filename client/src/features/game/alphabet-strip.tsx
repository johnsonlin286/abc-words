import { chalkFont } from "./fonts";

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

/** The 26 letters of the game; letters already drawn are crossed out. */
export default function AlphabetStrip({ used }: { used: string[] }) {
  return (
    <div>
      <ol
        aria-label="Huruf A sampai Z"
        className={`${chalkFont.className} grid grid-cols-13 gap-y-1 text-center text-3xl text-chalk sm:grid-cols-[repeat(26,minmax(0,1fr))] sm:text-[1.7rem]`}
      >
        {LETTERS.map((letter) => (
          <li key={letter}>
            {used.includes(letter) ? (
              <s className="text-chalk-dim/60 decoration-chalk-yellow decoration-2">{letter}</s>
            ) : (
              letter
            )}
          </li>
        ))}
      </ol>
      <p className="mt-1 text-xs text-chalk-dim">Huruf yang sudah keluar akan dicoret di sini.</p>
    </div>
  );
}
