import Image from "next/image";
import logo from "../../../public/logo.png";
import { CategoryNote, Sparks } from "./doodles";
import HeroCta, { START_ID } from "./hero-cta";
import HeroMotion from "./hero-motion";
import HomeActions from "./home-actions";

/** A loose red-pen underline, drawn in after the lead appears. */
function PenUnderline() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 -bottom-1.5 h-2.5 w-full overflow-visible"
    >
      <path
        data-anim="underline"
        pathLength={1}
        strokeDasharray="1"
        d="M2 6C25 3 55 2 98 5"
        fill="none"
        stroke="var(--color-redpen)"
        strokeWidth="3"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The home page is one section: the game's name and promise, two buttons (play / how to play),
 * then straight to playing: name, create or join a room, rooms open right now.
 */
export default function Hero() {
  return (
    <HeroMotion className="flex w-full flex-col gap-10">
      <section aria-labelledby="hero-title" className="flex flex-col gap-10">
        <div className="flex items-start justify-between gap-8">
          <div className="flex min-w-0 flex-col gap-5">
            {/* The logo is the name of the game, so it sits inside the heading instead of a header. */}
            <h1 id="hero-title" className="text-5xl leading-[1.05] font-bold sm:text-6xl">
              <span className="block overflow-hidden pb-1">
                <span data-anim="headline" className="block">
                  Main
                </span>
              </span>
              <span className="block overflow-hidden pt-1 pb-2">
                <span data-anim="logo" className="block">
                  <Image
                    src={logo}
                    alt="ABC Lima Dasar"
                    sizes="(min-width: 640px) 26rem, 90vw"
                    loading="eager"
                    fetchPriority="high"
                    className="h-auto w-full max-w-[26rem]"
                  />
                </span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span data-anim="headline" className="relative isolate inline-block">
                  <span
                    aria-hidden
                    data-anim="marker"
                    className="absolute -inset-x-2 top-[38%] bottom-0.5 -z-10 origin-left -rotate-1 rounded-[0.4em_0.2em_0.5em_0.25em] bg-highlight"
                  />
                  Online!
                </span>
              </span>
            </h1>

            <p
              data-anim="tagline"
              className="relative w-fit -rotate-1 rounded-sm bg-highlight-soft px-3 py-1 font-hand text-xl text-ink sm:text-2xl"
            >
              <Sparks className="-top-4 -left-5" />
              Permainan kata legendaris <span className="whitespace-nowrap">era 90-an,</span> kini online!
            </p>

            <p data-anim="lead" className="max-w-[34ch] text-lg leading-relaxed text-ink-soft sm:text-xl">
              Ajak temanmu,{" "}
              <span className="relative inline-block text-ink">
                tidak perlu daftar
                <PenUnderline />
              </span>
              , langsung main!
            </p>
          </div>

          <CategoryNote className="mt-2 mr-4 hidden shrink-0 sm:block" />
        </div>

        <div data-anim="cta">
          <HeroCta />
        </div>

        <div id={START_ID} data-anim="actions" className="scroll-mt-6">
          <HomeActions />
        </div>
      </section>
    </HeroMotion>
  );
}
