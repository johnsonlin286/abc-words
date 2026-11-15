"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonGhost } from "./ui";

/**
 * True when the previous history entry is a page of this site. The Navigation API knows this even
 * after client-side navigation (where `document.referrer` stays the first page's referrer).
 */
function canGoBack(): boolean {
  const nav = (window as { navigation?: { canGoBack: boolean } }).navigation;
  if (nav) return nav.canGoBack;
  return document.referrer.startsWith(window.location.origin) && window.history.length > 1;
}

/**
 * Goes back to the previous page when the visitor came from this site; opened directly
 * (shared link, new tab), there is nothing of ours to go back to, so it links to `fallbackHref`.
 */
export default function BackButton({ fallbackHref = "/", className = "" }: { fallbackHref?: string; className?: string }) {
  const router = useRouter();
  return (
    <Link
      href={fallbackHref}
      onClick={(e) => {
        if (canGoBack()) {
          e.preventDefault();
          router.back();
        }
      }}
      className={`${buttonGhost} -ml-4 ${className}`}
    >
      <ArrowLeft aria-hidden className="size-5" strokeWidth={2.5} />
      Kembali
    </Link>
  );
}
