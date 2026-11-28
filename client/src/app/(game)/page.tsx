import Hero from "@/components/home/hero";
import { LegalLinks } from "@/features/legal/legal-page";

export default function HomePage() {
  return (
    <>
      <Hero />
      <footer className="mt-auto pt-12">
        <LegalLinks />
      </footer>
    </>
  );
}
