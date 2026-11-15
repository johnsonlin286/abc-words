import type { Metadata, Viewport } from "next";
import { Fredoka, Kalam } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

/** Every word on the page: rounded, heavy and dark enough to read on ruled paper. */
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** The teacher's red-pen notes, and nothing else. */
const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "ABC Lima Dasar",
  description:
    "Permainan kata anak tahun 90-an, sekarang online: hitung jari, temukan hurufnya, adu kata paling cepat bareng teman.",
};

/** One light theme everywhere; tells browsers not to auto-darken it on dark-mode devices. */
export const viewport: Viewport = {
  colorScheme: "only light",
  themeColor: "#fdfbf4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${fredoka.variable} ${kalam.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
