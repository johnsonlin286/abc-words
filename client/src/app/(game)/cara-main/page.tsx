import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BackButton from "@/components/back-button";
import HowToPlayCards from "@/features/how-to-play/how-to-play-cards";
import logo from "../../../../public/logo.png";

export const metadata: Metadata = { title: "Cara bermain · ABC Lima Dasar" };

/** Cara bermain (same as the app): six short cards; every rule is one tap away on /cara-main/lengkap. */
export default function HowToPlayPage() {
  return (
    <article className="flex w-full max-w-md flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <BackButton />
        <Link href="/" aria-label="ABC Lima Dasar, ke beranda" className="w-fit rounded-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-redpen">
          <Image src={logo} alt="" sizes="180px" className="h-9 w-auto sm:h-10" />
        </Link>
      </header>
      <h1 className="sr-only">Cara bermain</h1>
      <HowToPlayCards />
    </article>
  );
}
