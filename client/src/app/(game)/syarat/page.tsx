import type { Metadata } from "next";
import LegalPage from "@/features/legal/legal-page";
import { TERMS } from "@/shared/legal-content";

export const metadata: Metadata = { title: "Syarat & ketentuan · ABC Lima Dasar" };

export default function TermsPage() {
  return <LegalPage doc={TERMS} />;
}
