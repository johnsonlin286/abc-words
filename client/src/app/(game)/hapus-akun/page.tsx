import type { Metadata } from "next";
import LegalPage from "@/features/legal/legal-page";
import { DELETION } from "@/shared/legal-content";

export const metadata: Metadata = { title: "Hapus akun · ABC Lima Dasar" };

export default function DeleteAccountPage() {
  return <LegalPage doc={DELETION} />;
}
