import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";
import {
  getLandingPageContent,
  type LandingPageContent,
  type LandingPageSection,
} from "@/lib/landing-pages";

export const metadata: Metadata = {
  title: "Nahrávání a produkce | stepansoukup.cz",
  description:
    "Nahrávání kapel, produkce, mix, mastering, kompletní songy i náběry stop ve studiu.",
};

function Icon({ type }: { type: string }) {
  const common = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (type) {
    case "studio":
      return (
        <svg {...common}>
          <path d="M12 3v18" />
          <path d="M7 7v10" />
          <path d="M17 7v10" />
          <path d="M4 11v2" />
          <path d="M20 11v2" />
        </svg>
      );
    case "mix":
      return (
        <svg {...common}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
          <path d="M8 4v4" />
          <path d="M15 10v4" />
          <path d="M11 16v4" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
          <path d="M12 2v3" />
          <path d="M12 19v3" />
          <path d="M4.9 4.9 7 7" />
          <path d="m17 17 2.1 2.1" />
          <path d="M2 12h3" />
          <path d="M19 12h3" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" />
          <path d="M4 7l8 6 8-6" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M9 18V5l10 7-10 6z" />
          <path d="M5 6v12" />
        </svg>
      );
  }
}

function MiniNav({ content }: { content: LandingPageContent }) {
  const navItems = [
    ...content.sections.map((section) => ({
      href: `#${section.id}`,
      label: section.navLabel,
      icon: section.icon,
    })),
    { href: "#kontakt", label: "Kontakt", icon: "mail" },
  ];

  return (
    <div className="sticky top-3 z-50 mx-auto -mt-7 max-w-6xl px-4 sm:px-6">
      <nav
        aria-label="Navigace stránky Studio"
        className="flex gap-2 overflow-x-auto rounded-full border border-graphite-border bg-graphite-bg/85 p-2 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="group inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm text-graphite-muted transition hover:bg-graphite-surface hover:text-graphite-accent"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-graphite-border bg-graphite-surface text-graphite-accent transition group-hover:border-graphite-accent">
              <Icon type={item.icon} />
            </span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

function StudioIllustration({
  variant,
  imageUrl,
  title,
}: {
  variant: string;
  imageUrl: string | null;
  title: string;
}) {
  if (imageUrl) {
    return (
      <div className="relative min-h-72 overflow-hidden rounded-[2rem] border border-white/10 bg-graphite-surface shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={title} className="h-full min-h-72 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-graphite-accent/15" />
      </div>
    );
  }

  if (variant === "console") {
    return (
      <div className="relative min-h-72 overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-2xl">
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="h-24 rounded-full bg-white/8 p-1">
                <div
                  className="rounded-full bg-graphite-accent/70"
                  style={{ height: `${35 + ((index * 17) % 55)}%` }}
                />
              </div>
              <div className="h-2 rounded-full bg-white/15" />
            </div>
          ))}
        </div>
        <div className="absolute -bottom-12 right-4 h-40 w-40 rounded-full bg-graphite-accent/25 blur-3xl" />
      </div>
    );
  }

  if (variant === "drums") {
    return (
      <div className="relative grid min-h-72 place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-graphite-accent/25 via-white/5 to-transparent p-8">
        <div className="absolute left-10 top-10 h-20 w-20 rounded-full border border-white/15" />
        <div className="absolute bottom-8 right-10 h-24 w-24 rounded-full border border-graphite-accent/40" />
        <div className="relative rounded-[2rem] border border-white/10 bg-graphite-bg/70 px-8 py-7 text-center shadow-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-graphite-accent">
            Production
          </p>
          <p className="mt-3 text-3xl font-medium">song od nuly</p>
          <p className="mt-2 text-sm text-graphite-muted">aranž + náběr + mix</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-72 overflow-hidden rounded-[2rem] border border-white/10 bg-graphite-surface p-6 shadow-2xl">
      <div className="flex h-full min-h-60 items-center gap-2">
        {Array.from({ length: 28 }).map((_, index) => (
          <div
            key={index}
            className="flex-1 rounded-full bg-graphite-accent/70"
            style={{ height: `${18 + ((index * 23) % 68)}%` }}
          />
        ))}
      </div>
      <div className="absolute left-8 top-8 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-graphite-muted">
        Cubase 14
      </div>
    </div>
  );
}

function FullWidthSection({
  section,
}: {
  section: LandingPageSection;
}) {
  return (
    <section
      id={section.id}
      className={`scroll-mt-24 py-20 sm:py-24 ${
        section.tone === "surface" ? "bg-graphite-surface/55" : "bg-graphite-bg"
      }`}
    >
      <div
        className={`mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center ${
          section.reverse ? "lg:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-graphite-accent">
            {section.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-5xl">
            {section.title}
          </h2>
          <p className="mt-5 text-lg leading-8 text-graphite-muted">{section.text}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {section.bullets.map((bullet) => (
              <span
                key={bullet}
                className="rounded-full border border-graphite-border bg-graphite-bg px-3 py-1 text-sm text-graphite-muted"
              >
                {bullet}
              </span>
            ))}
          </div>
        </div>
        <StudioIllustration
          variant={section.illustration}
          imageUrl={section.imageUrl}
          title={section.title}
        />
      </div>
    </section>
  );
}

export default async function RecordingPage() {
  const content = await getLandingPageContent("nahravani");

  return (
    <div className="min-h-full bg-graphite-bg text-graphite-text">
      <PublicHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-graphite-surface via-graphite-bg to-black pb-20 pt-16 sm:pb-24 sm:pt-24">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-graphite-accent/20 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative max-w-4xl">
            <p className="text-xs uppercase tracking-[0.25em] text-graphite-accent">
              {content.hero.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-medium tracking-tight sm:text-6xl lg:text-7xl">
              {content.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-graphite-muted">
              {content.hero.text}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/kontakt"
                className="rounded-full bg-graphite-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-graphite-accent-hover"
              >
                {content.hero.primaryLabel}
              </Link>
              <a
                href="#vybava"
                className="rounded-full border border-graphite-border px-5 py-3 text-sm font-medium text-graphite-text transition hover:border-graphite-accent hover:text-graphite-accent"
              >
                {content.hero.secondaryLabel}
              </a>
            </div>
          </div>
        </div>
      </section>

      <MiniNav content={content} />

      {content.sections.map((section) => (
        <FullWidthSection key={section.id} section={section} />
      ))}

      <section className="scroll-mt-24 bg-graphite-surface/55 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-graphite-accent">
            {content.references.eyebrow}
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <h2 className="text-3xl font-medium tracking-tight sm:text-5xl">
              {content.references.title}
            </h2>
            <p className="text-lg leading-8 text-graphite-muted">
              {content.references.text}
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {content.references.items.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-graphite-border bg-graphite-bg p-4 text-sm text-graphite-text"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kontakt" className="scroll-mt-24 bg-graphite-bg py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-graphite-accent">
            {content.cta.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-5xl">
            {content.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-graphite-muted">
            {content.cta.text}
          </p>
          <Link
            href="/kontakt"
            className="mt-8 inline-flex rounded-full bg-graphite-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-graphite-accent-hover"
          >
            {content.cta.buttonLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
