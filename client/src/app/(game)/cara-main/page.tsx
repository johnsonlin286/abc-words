import { Play } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BackButton from "@/components/back-button";
import { buttonPrimary } from "@/components/ui";
import HowToPlay from "@/features/game/how-to-play";
import logo from "../../../../public/logo.png";

export const metadata: Metadata = { title: "Cara bermain · ABC Lima Dasar" };

/** The rules written out on the notebook: a worked example first, then each step of a round. */
export default function HowToPlayPage() {
  return (
    <article className="flex w-full flex-col gap-10">
      <header className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <BackButton />
          <Link href="/" aria-label="ABC Lima Dasar, ke beranda" className="w-fit rounded-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-redpen">
            <Image src={logo} alt="" sizes="180px" className="h-9 w-auto sm:h-10" />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl leading-tight font-bold sm:text-6xl">
            <span className="relative isolate inline-block">
              <span
                aria-hidden
                className="absolute -inset-x-2 top-[42%] bottom-1 -z-10 -rotate-1 rounded-[0.4em_0.2em_0.5em_0.25em] bg-highlight"
              />
              Cara bermain
            </span>
          </h1>
          <p className="max-w-[40ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
            Hitung jari, dapat huruf, adu kata! Satu ronde <span className="whitespace-nowrap">kira-kira</span> begini:
          </p>
        </div>
      </header>

      <HowToPlay />

      <div className="flex flex-col items-start gap-3 border-t-2 border-dashed border-ink-faint pt-8">
        <p className="text-xl font-bold">Sudah paham? Ajak temanmu!</p>
        <Link href="/#mulai" className={`${buttonPrimary} px-6 py-3 text-lg`}>
          <Play aria-hidden className="size-5 fill-current" strokeWidth={2.5} />
          Main sekarang
        </Link>
      </div>
    </article>
  );
}
