import {
  AFK_ROUNDS,
  ANSWER_MAX,
  ANSWER_MIN,
  ANSWER_MS,
  ANSWER_RETRY_COOLDOWN_MS,
  ANSWER_RETRY_LIMIT,
  ANSWER_RETRY_WINDOW_MS,
  CHAT_SPAM,
  LAST_PLAYER_MS,
  LIMITS,
  LONE_REJECTION_WARNINGS,
  MAX_ROUNDS,
  MIN_PLAYERS,
  PICK_MS,
  POINTS,
  REJECT_REASONS,
  REJECTIONS,
  VOTING_MS,
  formatPoints,
} from "@/shared/game";
import { chalkFont } from "./fonts";

const seconds = (ms: number) => `${ms / 1000} detik`;

const SCORE_ROWS = [
  { label: "Jawaban lolos", points: POINTS.accepted },
  { label: "Jawaban gugur", points: POINTS.rejected },
  { label: "Tidak menjawab", points: POINTS.noAnswer },
  {
    label: `Menolak sendirian jawaban yang tetap lolos, mulai kali ke-${LONE_REJECTION_WARNINGS + 1} (${MIN_PLAYERS + 1}+ pemain)`,
    points: POINTS.loneRejection,
  },
];

const STEPS = [
  {
    title: "Siapkan room",
    body: [
      `Butuh ${MIN_PLAYERS}–${LIMITS.maxMembers} pemain. Host memilih kategori, bahasa jawaban, dan jumlah ronde (maksimal ${MAX_ROUNDS}).`,
    ],
  },
  {
    title: "Tunjukkan angka",
    body: [
      `Setiap pemain memilih angka 1–10 dalam ${seconds(PICK_MS)}. Angka pemain lain baru terlihat setelah semua memilih.`,
      "Yang tidak sempat memilih dipilihkan angka acak oleh server 🎲.",
      `Tidak memilih angka dan tidak menjawab ${AFK_ROUNDS} ronde berturut-turut: kamu ditandai AFK dan permainan tidak menunggumu, sampai kamu memilih angka atau menjawab lagi.`,
    ],
  },
  {
    title: "Huruf ronde",
    body: [
      "Semua angka dijumlahkan lalu dihitung dari A: 1 = A, 26 = Z, 27 kembali ke A.",
      "Huruf yang sudah pernah keluar dilompati ke huruf berikutnya.",
    ],
  },
  {
    title: "Menjawab",
    body: [
      `Tulis satu jawaban berawalan huruf itu, sesuai kategori, dalam ${seconds(ANSWER_MS)}.`,
      `Hanya huruf dan spasi, ${ANSWER_MIN}–${ANSWER_MAX} karakter. Angka ditulis dengan huruf: "300" jadi "three hundred".`,
      "Tidak boleh sama dengan jawaban pemain lain, dan harus diketik sendiri (tidak bisa ditempel).",
      `Jangan menebak-nebak: ${ANSWER_RETRY_LIMIT} jawaban ditolak dalam ${seconds(ANSWER_RETRY_WINDOW_MS)} membuatmu harus menunggu ${seconds(ANSWER_RETRY_COOLDOWN_MS)}.`,
      `Kalau tinggal kamu yang belum menjawab, sisa waktumu ${seconds(LAST_PLAYER_MS)}.`,
      "Keduluan kata yang sama sesaat sebelum kamu? Waktumu ditambah untuk mencoba kata lain.",
    ],
  },
  {
    title: "Voting",
    body: [
      `Selama ${seconds(VOTING_MS)}, tolak jawaban yang tidak sesuai dengan memilih alasannya: ${REJECT_REASONS.map((r) => r.label.toLowerCase()).join(", ")}. Semua pemain bisa melihat siapa menolak dan alasannya.`,
      "Jawaban gugur kalau lebih dari separuh pemain lain menolaknya.",
      `Jatah tolak ${REJECTIONS.normal} per permainan (main berdua: ${REJECTIONS.twoPlayers}). Tolakan yang didukung pemain lain dan menggugurkan jawaban dikembalikan ke jatahmu.`,
      `Menolak sendirian jawaban yang ternyata tetap lolos dihitung per permainan. Kali ke-${LONE_REJECTION_WARNINGS} mendapat tanda peringatan ${LONE_REJECTION_WARNINGS}/${LONE_REJECTION_WARNINGS + 1} di papan skor. Mulai kali ke-${LONE_REJECTION_WARNINGS + 1} dianggap sengaja: ${formatPoints(POINTS.loneRejection)} poin setiap kali.`,
      'Tekan "Selesai menilai" kalau sudah. Begitu semua selesai, hasil langsung keluar.',
    ],
  },
  {
    title: "Obrolan",
    body: [
      `Lebih dari ${CHAT_SPAM.floodLimit} pesan dalam ${seconds(CHAT_SPAM.floodWindowMs)}, atau pesan yang sama ${CHAT_SPAM.repeatLimit}× berturut-turut, dianggap spam dan tidak dikirim.`,
      "Pesan yang mengandung kata kasar (bahasa Indonesia, daerah, Inggris, dan beberapa bahasa lain) juga tidak dikirim.",
      `Melanggar lagi setelah diperingatkan, entah spam atau kata kasar: kamu dibisukan ${CHAT_SPAM.muteMs / 60_000} menit. Hanya kamu yang diberi tahu.`,
    ],
  },
];

/** Game rules, shown on /cara-main and in the room's rules dialog. */
export default function HowToPlay({ headingLevel = 1 }: { headingLevel?: 1 | 2 }) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const Sub = headingLevel === 1 ? "h2" : "h3";

  return (
    <div className="space-y-5 text-chalk">
      <Heading className={`${chalkFont.className} text-3xl`}>Cara main</Heading>

      <ol className="space-y-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span
              aria-hidden
              className={`${chalkFont.className} w-6 shrink-0 text-2xl leading-7 text-chalk-yellow`}
            >
              {i + 1}
            </span>
            <div>
              <Sub className="font-medium">{step.title}</Sub>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-chalk-dim marker:text-chalk-dim/60">
                {step.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <section>
        <Sub className="mb-2 font-medium">Poin</Sub>
        <table className="w-full text-sm">
          <tbody>
            {SCORE_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-chalk-dim/20 last:border-0">
                <td className="py-1.5 pr-3 text-chalk-dim">{row.label}</td>
                <td
                  className={`py-1.5 text-right font-medium tabular-nums ${row.points > 0 ? "text-chalk-yellow" : "text-chalk-pink"}`}
                >
                  {formatPoints(row.points)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-sm text-chalk-dim">
          Skor tidak bisa di bawah 0. Skor tertinggi setelah ronde terakhir menang; skor sama berarti juara bersama.
        </p>
      </section>
    </div>
  );
}
