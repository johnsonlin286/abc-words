import type { Metadata } from "next";
import LegalPage from "@/features/legal/legal-page";
import { PRIVACY } from "@/shared/legal-content";

export const metadata: Metadata = { title: "Kebijakan privasi · ABC Lima Dasar" };

export default function PrivacyPage() {
  return <LegalPage doc={PRIVACY} />;
}
