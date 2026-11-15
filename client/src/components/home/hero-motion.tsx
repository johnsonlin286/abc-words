"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

/**
 * The home page's one orchestrated moment: the headline rises around the logo and gets
 * highlighted, the category note lands and is ticked, the lead is underlined in red pen,
 * then the buttons and the sign-in card come up.
 * Elements opt in with `data-anim`; they start hidden (globals.css) and only on devices that allow
 * motion. With reduced motion everything is simply shown.
 */
export default function HeroMotion({ className, children }: { className?: string; children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = (name: string, within = "") =>
        gsap.utils.toArray<HTMLElement>(`${within} [data-anim="${name}"]`.trim(), scope.current);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(q("logo"), { autoAlpha: 0, yPercent: 60, rotate: -4, duration: 0.6, ease: "back.out(1.8)" }, 0.22)
          .from(q("headline"), { autoAlpha: 0, yPercent: 105, duration: 0.7, stagger: 0.4 }, 0.05)
          // The highlighter swipes across "Online!" once it has landed.
          .from(q("marker"), { autoAlpha: 0, scaleX: 0, duration: 0.45, ease: "power2.inOut" }, 0.85)
          .from(q("note-card"), { autoAlpha: 0, y: -40, rotate: 14, duration: 0.7, ease: "back.out(1.6)" }, 0.45)
          .from(q("tick"), { autoAlpha: 0, scale: 0, duration: 0.25, stagger: 0.09, ease: "back.out(3)" }, 0.95)
          .from(q("tagline"), { autoAlpha: 0, x: -14, rotate: -4, duration: 0.45, ease: "back.out(2)" }, 0.55)
          .from(q("spark", '[data-anim="tagline"]'), { autoAlpha: 0, scale: 0, transformOrigin: "100% 100%", duration: 0.3 }, 0.85)
          .from(q("lead"), { autoAlpha: 0, y: 12, duration: 0.5 }, 0.7)
          .fromTo(
            q("underline"),
            { autoAlpha: 1, strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 0.45, ease: "power2.out", immediateRender: false },
            1.15,
          )
          .from(q("cta"), { autoAlpha: 0, y: 16, duration: 0.5, ease: "back.out(2)" }, 1.05)
          .from(q("actions"), { autoAlpha: 0, y: 18, duration: 0.5 }, 1.2);
      });

      // Reduced motion: no tweens; show everything in its final state.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(scope.current!.querySelectorAll("[data-anim]"), { autoAlpha: 1 });
        gsap.set(q("underline"), { strokeDashoffset: 0 });
      });
    },
    { scope },
  );

  return (
    <div ref={scope} className={`hero-motion ${className ?? ""}`}>
      {children}
    </div>
  );
}
