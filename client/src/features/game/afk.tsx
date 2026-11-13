import { AFK_ROUNDS, type GameState } from "@/shared/game";
import InfoBadge from "./info-badge";

/** Same rule as the server: this many rounds in a row without picking a number or answering. */
export function isAfk(state: GameState, userId: string): boolean {
  return (state.idleRounds[userId] ?? 0) >= AFK_ROUNDS;
}

/** "AFK" next to a player the game no longer waits for; tapping it says why. */
export function AfkBadge({ name }: { name: string }) {
  return (
    <InfoBadge
      label={`${name} AFK`}
      explanation={`${name} tidak memilih angka dan tidak menjawab ${AFK_ROUNDS} ronde berturut-turut, jadi permainan tidak menunggunya. Begitu ${name} memilih angka atau menjawab, ia aktif lagi.`}
      className="rounded-full border border-chalk-dim/50 px-1.5 py-0.5 text-chalk-dim"
    >
      AFK
    </InfoBadge>
  );
}

/** Shown to the AFK player themself, so they know how to get back in. */
export function AfkNotice() {
  return (
    <p role="status" className="rounded-md border border-chalk-yellow/60 px-3 py-2 text-sm text-chalk">
      Kamu dianggap AFK karena {AFK_ROUNDS} ronde tidak memilih angka dan tidak menjawab, jadi permainan tidak
      menunggumu. Pilih angka atau kirim jawaban untuk kembali aktif.
    </p>
  );
}
