import type { Metadata } from "next";
import Link from "next/link";
import HowToPlay from "@/features/game/how-to-play";

export const metadata: Metadata = { title: "Cara main · ABC Words" };

export default function HowToPlayPage() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-zinc-200 shadow-sm dark:border-zinc-800">
      <section className="space-y-6 bg-board p-5 sm:p-7">
        <HowToPlay />
        <Link
          href="/"
          className="inline-block rounded-md bg-chalk-yellow px-5 py-2 font-medium text-board-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk"
        >
          Ayo main
        </Link>
      </section>
    </div>
  );
}
