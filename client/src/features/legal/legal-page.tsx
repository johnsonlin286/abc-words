import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import BackButton from "@/components/back-button";
import { buttonPrimary, linkButton } from "@/components/ui";
import CopyEmail from "./copy-email";
import { CONTACT_EMAIL, UPDATED_AT, type LegalDoc } from "@/shared/legal-content";
import logo from "../../../public/logo.png";

const DELETION_SUBJECT = "Hapus akun ABC Lima Dasar";
const DELETION_BODY = "Mohon hapus akun ABC Lima Dasar saya.\n\nNama panggilan: ";

/**
 * One legal page (Kebijakan Privasi, Syarat & Ketentuan, Hapus akun), written on the notebook sheet:
 * the text comes from shared/legal-content.ts, which the app shows too. Plain reading, no motion.
 */
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const deletion = doc.path === "/hapus-akun";
  return (
    <article className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <BackButton />
          <Link
            href="/"
            aria-label="ABC Lima Dasar, ke beranda"
            className="w-fit rounded-md focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-redpen"
          >
            <Image src={logo} alt="" sizes="180px" className="h-9 w-auto sm:h-10" />
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
            <span className="relative isolate inline-block">
              <span
                aria-hidden
                className="absolute -inset-x-2 top-[42%] bottom-1 -z-10 -rotate-1 rounded-[0.4em_0.2em_0.5em_0.25em] bg-highlight"
              />
              {doc.title}
            </span>
          </h1>
          <p className="text-sm font-medium text-ink-faint">Diperbarui {UPDATED_AT}</p>
          <p className="text-lg leading-relaxed text-ink-soft">{doc.intro}</p>
        </div>
      </header>

      {doc.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">{section.heading}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p} className="leading-relaxed text-ink-soft">
              {p}
            </p>
          ))}
          {section.items && (
            <ul
              className={`flex flex-col gap-1.5 pl-5 leading-relaxed text-ink-soft marker:text-ink-faint ${
                deletion && section.heading === "Dari aplikasi" ? "list-decimal marker:font-bold" : "list-disc"
              }`}
            >
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {section.note && <p className="leading-relaxed text-ink-soft">{section.note}</p>}
          {section.link && (
            <Link href={section.link.path} className={`${linkButton} w-fit`}>
              {section.link.label}
            </Link>
          )}
        </section>
      ))}

      <footer className="flex flex-col items-start gap-3 border-t-2 border-dashed border-ink-faint pt-6">
        <p className="text-xl font-bold">{deletion ? "Sudah tidak punya aplikasinya?" : "Ada pertanyaan?"}</p>
        {deletion ? (
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(DELETION_SUBJECT)}&body=${encodeURIComponent(DELETION_BODY)}`}
            className={`${buttonPrimary} px-6 py-3 text-lg`}
          >
            <Mail aria-hidden className="size-5" strokeWidth={2.5} />
            Kirim Email Hapus Akun
          </a>
        ) : (
          <p className="leading-relaxed text-ink-soft">
            Tulis email ke <CopyEmail email={CONTACT_EMAIL} />
          </p>
        )}
        {deletion && (
          <p className="leading-relaxed text-ink-soft">
            atau tulis email ke <CopyEmail email={CONTACT_EMAIL} />
          </p>
        )}
      </footer>
    </article>
  );
}

/** The small links at the bottom of the home page and of each legal page. */
export function LegalLinks() {
  return (
    <nav aria-label="Informasi" className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
      <Link href="/privasi" className={`${linkButton} font-medium text-ink-soft`}>
        Kebijakan Privasi
      </Link>
      <Link href="/syarat" className={`${linkButton} font-medium text-ink-soft`}>
        Syarat & Ketentuan
      </Link>
      <Link href="/hapus-akun" className={`${linkButton} font-medium text-ink-soft`}>
        Hapus Akun
      </Link>
    </nav>
  );
}
