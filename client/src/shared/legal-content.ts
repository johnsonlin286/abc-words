/**
 * Kebijakan Privasi, Syarat & Ketentuan and the account-deletion page, as plain text. The web renders
 * them on /privasi, /syarat and /hapus-akun; the app shows the same text in Pengaturan. Keep this file
 * a verbatim copy in mobile-app/src/shared/legal-content.ts, and change UPDATED_AT with every change.
 *
 * What it says about data must stay true to the code: the `users` and `refresh_tokens` tables
 * (backend/src/project/db/schema.ts), in-memory rooms, no analytics. Check it when either changes.
 */

export const OPERATOR = "WWGM";
export const CONTACT_EMAIL = "hello@werewolfgm.app";
export const UPDATED_AT = "28 November 2026";
/** Days within which an emailed deletion request is carried out (owner's commitment). */
export const DELETION_REQUEST_DAYS = 7;

export type LegalSection = {
  heading: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
  /** A closing line after the list. */
  note?: string;
  /** A page of the same site the section points to (the app maps it to its own screen). */
  link?: { label: string; path: LegalPath };
};

export type LegalPath = "/privasi" | "/syarat" | "/hapus-akun";

export type LegalDoc = {
  path: LegalPath;
  title: string;
  intro: string;
  sections: readonly LegalSection[];
};

export const PRIVACY: LegalDoc = {
  path: "/privasi",
  title: "Kebijakan Privasi",
  intro: `ABC Lima Dasar dikelola oleh ${OPERATOR} ("kami"). Halaman ini menjelaskan data apa yang kami simpan saat kamu bermain di aplikasi Android atau di web, untuk apa, dan cara menghapusnya. Kami menyimpan sesedikit mungkin.`,
  sections: [
    {
      heading: "Pemain web (tamu)",
      paragraphs: [
        "Di web kamu bermain tanpa akun. Nama panggilanmu disimpan di tab browser itu saja, dan di server hanya selama room berjalan.",
      ],
    },
    {
      heading: "Akun aplikasi (masuk dengan Google)",
      paragraphs: ["Saat kamu masuk dengan Google, kami menyimpan:"],
      items: [
        "ID akun Google, supaya kamu bisa masuk lagi ke akun yang sama.",
        "Alamat email, untuk dukungan bila kamu menghubungi kami. Email hanya terlihat olehmu.",
        "Nama panggilan pilihanmu, yang terlihat oleh pemain lain.",
        "Jumlah kunci room dan kapan kunci terakhir dipakai.",
        "Kapan akun dibuat dan kapan terakhir masuk.",
      ],
    },
    {
      heading: "Yang tidak kami simpan",
      items: [
        "Kata sandi Google. Google yang memeriksanya, bukan kami.",
        "Foto profil, kontak, lokasi, atau data lain dari akun Googlemu.",
        "Token masuk dalam bentuk asli. Aplikasi menyimpannya di penyimpanan aman ponsel, dan server hanya menyimpan sidiknya (hash).",
      ],
    },
    {
      heading: "Selama permainan",
      paragraphs: [
        "Jawaban, tolakan, skor, pesan chat dan alamat IP (untuk membatasi spam dan tebakan password room) hanya ada di memori server selama room berjalan. Semua itu tidak disimpan ke database dan hilang saat room selesai.",
        "Pemain lain di room yang sama melihat nama panggilanmu, jawabanmu, siapa yang kamu tolak beserta alasannya, dan pesan chatmu.",
      ],
    },
    {
      heading: "Di ponselmu",
      paragraphs: [
        "Pengaturan Musik, Efek suara dan Getar disimpan di ponselmu saja. Aplikasi tidak meminta izin mikrofon, kamera, kontak atau lokasi.",
      ],
    },
    {
      heading: "Untuk apa datanya",
      items: [
        "Membuat dan mengenali akunmu.",
        "Menjaga nama panggilan tetap unik.",
        "Menghitung kunci room.",
        "Menjalankan permainan dan chat.",
        "Mencegah penyalahgunaan (spam, kata kasar, tebakan password).",
        "Membalas pesanmu.",
      ],
    },
    {
      heading: "Iklan dan pelacak",
      paragraphs: [
        "Saat ini tidak ada iklan, analitik, atau pelacak pihak ketiga. Bila nanti ada iklan, kami perbarui kebijakan ini sebelum iklan pertama tampil.",
        "Kami tidak menjual atau menyewakan datamu kepada siapa pun.",
      ],
    },
    {
      heading: "Pihak lain",
      items: [
        "Google, untuk masuk dengan Google dan Google Play. Penggunaannya diatur Kebijakan Privasi Google.",
        "Penyedia server tempat permainan dan database berjalan. Mereka hanya menyimpan data untuk kami.",
      ],
      note: "Kami hanya membuka data kepada pihak berwenang bila diwajibkan hukum.",
    },
    {
      heading: "Keamanan dan lama penyimpanan",
      paragraphs: [
        "Data dikirim lewat koneksi terenkripsi (HTTPS). Akun disimpan sampai kamu menghapusnya. Token masuk berlaku paling lama 30 hari lalu dibersihkan.",
      ],
    },
    {
      heading: "Hak kamu",
      paragraphs: [
        "Sesuai UU Pelindungan Data Pribadi, kamu boleh melihat, membetulkan dan menghapus datamu. Nama panggilan dan email terlihat di Pengaturan, dan nama bisa diganti di sana.",
        "Hapus akun di Pengaturan menghapus semua data akunmu saat itu juga. Nama panggilanmu lalu bisa dipakai orang lain.",
      ],
      link: { label: "Cara Hapus Akun", path: "/hapus-akun" },
    },
    {
      heading: "Anak-anak",
      paragraphs: [
        "ABC Lima Dasar untuk usia 13 tahun ke atas. Pemain yang lebih muda sebaiknya bermain bersama orang tua.",
        "Kami tidak sengaja mengumpulkan data anak di bawah 13 tahun. Bila ada, hubungi kami dan kami hapus.",
      ],
    },
    {
      heading: "Perubahan",
      paragraphs: [
        "Bila kebijakan ini berubah, kami perbarui halaman ini dan tanggalnya.",
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  path: "/syarat",
  title: "Syarat & Ketentuan",
  intro: `Syarat ini berlaku saat kamu bermain ABC Lima Dasar, di aplikasi maupun di web. ABC Lima Dasar dikelola oleh ${OPERATOR}. Dengan bermain, kamu menyetujui syarat ini.`,
  sections: [
    {
      heading: "Usia",
      paragraphs: [
        "Kamu berusia 13 tahun ke atas, atau bermain bersama orang tua atau wali.",
      ],
    },
    {
      heading: "Akun dan nama panggilan",
      items: [
        "Satu akun Google untuk satu orang. Jaga akunmu sendiri.",
        "Nama panggilan tidak boleh kasar, menghina, atau menyamar sebagai orang lain.",
        "Nama yang melanggar boleh kami tolak atau ganti.",
      ],
    },
    {
      heading: "Bermain dengan sportif",
      items: [
        "Jangan memakai bot, skrip, atau cara lain untuk curang.",
        "Jangan spam jawaban atau chat.",
        "Jangan menghina, mengancam, atau melecehkan pemain lain.",
        "Kata kasar diblokir otomatis, dan pengirim spam di-mute sementara.",
      ],
    },
    {
      heading: "Penilaian jawaban",
      paragraphs: [
        "Jawaban dinilai lewat daftar kata dan tolakan pemain, sesuai Aturan lengkap. Daftar kata kami tidak lengkap dan bisa keliru. Hasil yang sudah tampil di layar berlaku untuk permainan itu.",
      ],
    },
    {
      heading: "Kunci room",
      paragraphs: [
        "Kunci room terisi sendiri seiring waktu. Kunci hanya berlaku di dalam permainan: tidak bisa ditukar dengan uang, diuangkan, atau dipindahkan ke akun lain. Jumlah dan waktu isi ulangnya boleh kami ubah.",
      ],
    },
    {
      heading: "Layanan apa adanya",
      paragraphs: [
        "ABC Lima Dasar gratis dan disediakan apa adanya. Room bisa terputus dan server bisa berhenti untuk perawatan. Skor tidak disimpan setelah permainan selesai.",
        "Kami boleh mengubah, menghentikan sementara, atau mengakhiri layanan. Sejauh diizinkan hukum, kami tidak bertanggung jawab atas kerugian karena layanan tidak tersedia.",
      ],
    },
    {
      heading: "Penghentian",
      paragraphs: [
        "Akun yang melanggar syarat ini boleh kami tangguhkan atau hapus. Kamu boleh berhenti dan menghapus akunmu kapan saja.",
      ],
      link: { label: "Cara Hapus Akun", path: "/hapus-akun" },
    },
    {
      heading: "Konten pihak lain",
      paragraphs: [
        "Sebagian daftar kata dan suara berasal dari sumber terbuka dengan lisensinya sendiri: GeoNames (CC BY 4.0), Wordnet Bahasa (MIT), Kenney (CC0) dan Pixabay. Sumbernya ditulis di Aturan lengkap.",
      ],
    },
    {
      heading: "Data pribadi",
      paragraphs: ["Cara kami memakai datamu ada di Kebijakan Privasi."],
      link: { label: "Kebijakan Privasi", path: "/privasi" },
    },
    {
      heading: "Hukum dan perubahan",
      paragraphs: [
        "Syarat ini tunduk pada hukum Republik Indonesia. Bila syarat berubah, kami perbarui halaman ini dan tanggalnya. Terus bermain setelahnya berarti kamu menyetujui syarat yang baru.",
      ],
    },
  ],
};

export const DELETION: LegalDoc = {
  path: "/hapus-akun",
  title: "Hapus akun",
  intro: `Akun ABC Lima Dasar (aplikasi Android, dikelola ${OPERATOR}) bisa dihapus kapan saja, langsung dari aplikasi atau lewat email.`,
  sections: [
    {
      heading: "Dari aplikasi",
      items: [
        "Buka aplikasi dan ketuk tombol roda gigi di atas layar utama.",
        "Di bagian Akun, ketuk Hapus Akun.",
        "Ketuk Hapus Akun sekali lagi untuk memastikan. Akun langsung terhapus.",
      ],
    },
    {
      heading: "Tanpa aplikasi",
      paragraphs: [
        `Kirim email ke ${CONTACT_EMAIL} dari alamat Gmail akunmu, dengan subjek "Hapus akun ABC Lima Dasar" dan nama panggilanmu. Kami hapus dalam ${DELETION_REQUEST_DAYS} hari lalu membalas emailmu.`,
      ],
    },
    {
      heading: "Yang dihapus",
      items: [
        "ID akun Google dan alamat email.",
        "Nama panggilan. Setelah itu nama tersebut bisa dipakai orang lain.",
        "Kunci room dan semua token masuk.",
      ],
      note: "Tidak ada data akun yang kami simpan setelahnya. Data permainan memang tidak pernah disimpan: jawaban, skor dan chat hilang saat room selesai.",
    },
    {
      heading: "Pemain web",
      paragraphs: [
        "Bermain di web tidak membuat akun, jadi tidak ada yang perlu dihapus. Menutup tab menghapus nama panggilanmu dari browser.",
      ],
    },
    {
      heading: "Masuk lagi nanti",
      paragraphs: [
        "Bila kamu masuk lagi dengan akun Google yang sama, kamu mulai dari awal sebagai akun baru.",
      ],
    },
  ],
};

export const LEGAL_DOCS: Record<LegalPath, LegalDoc> = {
  "/privasi": PRIVACY,
  "/syarat": TERMS,
  "/hapus-akun": DELETION,
};
