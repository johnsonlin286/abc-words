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

const description =
  "Permainan kata legendaris era 90-an, kini online. Hitung jari, dapat huruf, adu kata bareng teman. Tanpa daftar, langsung main!";

export const metadata: Metadata = {
  // Share previews need absolute image URLs; set SITE_URL to the public address in production.
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: "ABC Lima Dasar",
  description,
  openGraph: {
    title: "Main ABC Lima Dasar Online!",
    description,
    siteName: "ABC Lima Dasar",
    locale: "id_ID",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Main ABC Lima Dasar Online!", description },
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
