// What the rules say, shared by the rules page (/cara-main) and the in-room rules dialog.
// Numbers come from @/shared/game so the text always matches the server.
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
  MIN_REJECTIONS_TO_FAIL,
  PICK_MS,
  POINTS,
  REJECT_REASONS,
  REJECTIONS,
  REVEAL_MS,
  VOTING_MS,
  formatPoints,
} from "@/shared/game";

const seconds = (ms: number) => `${ms / 1000} detik`;

export const SCORE_ROWS = [
  { label: "Jawaban lolos", points: POINTS.accepted },
  { label: "Jawaban gugur", points: POINTS.rejected },
  { label: "Tidak menjawab", points: POINTS.noAnswer },
  {
    label: `Menolak sendirian jawaban yang tetap lolos, mulai kali ke-${LONE_REJECTION_WARNINGS + 1}`,
    points: POINTS.loneRejection,
  },
];

export const STEPS = [
  {
    title: "Siapkan room",
    body: [
      `Butuh ${MIN_PLAYERS}–${LIMITS.maxMembers} pemain. Host memilih kategori dan jumlah ronde (maksimal ${MAX_ROUNDS}).`,
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
      `Hurufnya sulit? Saat huruf baru keluar, kamu punya ${seconds(REVEAL_MS)} untuk memilih "Ganti huruf" atau "Tetap". Kalau lebih dari separuh pemain memilih ganti, huruf itu dicoret dan diganti huruf acak yang belum pernah keluar (bisa lebih mudah, bisa juga lebih sulit). Paling banyak sekali per ronde.`,
      'Begitu hasilnya pasti (separuh pemain memilih "Tetap", atau huruf sudah diganti), permainan langsung lanjut tanpa menunggu waktu habis.',
    ],
  },
  {
    title: "Menjawab",
    body: [
      `Tulis satu jawaban berawalan huruf itu, sesuai kategori, dalam ${seconds(ANSWER_MS)}.`,
      'Jawaban dalam bahasa Indonesia: tulis "Jepang", bukan "Japan"; "Kucing", bukan "Cat".',
      `Hanya huruf dan spasi, ${ANSWER_MIN}–${ANSWER_MAX} karakter. Angka ditulis dengan huruf ("300" jadi "tiga ratus") dan simbol dibuang.`,
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
      'Jawaban bertanda "Terverifikasi" ada di daftar kata kategori itu (Negara, Kota, dan Hewan), jadi langsung lolos dan tidak bisa ditolak. Jawaban yang tidak ada di daftar tetap boleh, dinilai lewat voting.',
      `Jawaban gugur kalau lebih dari separuh pemain lain menolaknya, minimal ${MIN_REJECTIONS_TO_FAIL} orang. Satu orang tidak bisa menggugurkan jawaban sendirian.`,
      `Jatah tolak ${REJECTIONS} per permainan. Tolakan yang didukung pemain lain dan menggugurkan jawaban dikembalikan ke jatahmu.`,
      `Menolak sendirian jawaban yang ternyata tetap lolos dihitung per permainan. Kali ke-${LONE_REJECTION_WARNINGS} mendapat tanda peringatan ${LONE_REJECTION_WARNINGS}/${LONE_REJECTION_WARNINGS + 1} di papan skor. Mulai kali ke-${LONE_REJECTION_WARNINGS + 1} dianggap sengaja: ${formatPoints(POINTS.loneRejection)} poin setiap kali.`,
      'Tekan "Selesai menilai" kalau sudah. Begitu semua selesai, hasil langsung keluar.',
    ],
  },
];

/** Chat rules: not a step of a round, so kept apart from STEPS. */
export const CHAT_RULES = [
  `Lebih dari ${CHAT_SPAM.floodLimit} pesan dalam ${seconds(CHAT_SPAM.floodWindowMs)}, atau pesan yang sama ${CHAT_SPAM.repeatLimit}× berturut-turut, dianggap spam dan tidak dikirim.`,
  "Pesan yang mengandung kata kasar (bahasa Indonesia, daerah, Inggris, dan beberapa bahasa lain) juga tidak dikirim.",
  `Melanggar lagi setelah diperingatkan, entah spam atau kata kasar: kamu dibisukan ${CHAT_SPAM.muteMs / 60_000} menit. Hanya kamu yang diberi tahu.`,
];

export const SCORE_NOTE =
  "Skor tidak bisa di bawah 0. Skor tertinggi setelah ronde terakhir menang. Kalau skor sama, yang rata-rata menjawab lebih cepat (dihitung dari jawaban yang lolos, sampai milidetik) di atas; kalau itu pun sama, juara bersama.";
