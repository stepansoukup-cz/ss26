import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { PublicHeader } from "@/components/site/PublicHeader";

export const metadata: Metadata = {
  title: "Kontakt | stepansoukup.cz",
  description: "Kontaktní formulář pro obecné dotazy a poptávky.",
};

export default function ContactPage() {
  return (
    <div className="min-h-full bg-graphite-bg text-graphite-text">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <header className="mb-8 border-b border-graphite-border pb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-graphite-muted">
            Kontakt
          </p>
          <h1 className="mt-2 text-3xl font-medium sm:text-4xl">
            Napiš mi
          </h1>
          <p className="mt-3 max-w-2xl leading-7 text-graphite-muted">
            Formulář je bez příloh. Pokud potřebuješ poslat soubory, domluvíme
            se po prvním kontaktu na vhodném způsobu předání.
          </p>
        </header>

        <section className="rounded-2xl border border-graphite-border bg-graphite-surface/55 p-5 sm:p-6">
          <ContactForm />
        </section>
      </main>
    </div>
  );
}
