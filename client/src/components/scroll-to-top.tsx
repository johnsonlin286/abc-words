"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

/**
 * Every page opens at the top: after a link, after back/forward and after a reload.
 * The browser's own scroll restoration is turned off for that. Links to an anchor
 * (`/#mulai`) are left alone so they still land on their target.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  useLayoutEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
