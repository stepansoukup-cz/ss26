import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";
import {
  getLandingPageContent,
  type LandingPageContent,
  type LandingPageSection,
} from "@/lib/landing-pages";

export const metadata: Metadata = {
  title: "Hudba | stepansoukup.cz",
  description:
    "Hudební stránka Štěpána Soukupa: Zakázané ovoce, bio, Spotify, videoklipy a fotky.",
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
    case "spotify":
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />
          <path d="M8 10.2c2.8-.8 5.3-.5 7.6.8" />
          <path d="M8.5 13c2-.5 4-.3 5.8.8" />
          <path d="M9 15.5c1.5-.3 3-.1 4.2.6" />
        </svg>
      );
    case "video":
      return (
        <svg {...common}>
          <path d="M5 6h14v12H5z" />
          <path d="m10 9 5 3-5 3V9Z" />
        </svg>
      );
    case "photo":
      return (
        <svg {...common}>
          <path d="M4 6h16v12H4z" />
          <path d="m7 15 3-3 2 2 2.5-3 3.5 4" />
          <circle cx="8.5" cy="9.5" r="1" />
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
          <path d="M9 18V5l10 7-10 6Z" />
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
        aria-label="Navigace stránky Hudba"
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

function findSection(content: LandingPageContent, id: string) {
  return content.sections.find((section) => section.id === id);
}

function sectionClassName(section?: LandingPageSection) {
  return `scroll-mt-24 py-20 sm:py-24 ${
    section?.tone === "surface" ? "bg-graphite-surface/55" : "bg-graphite-bg"
  }`;
}

function YoutubeEmbed({ url, title }: { url: string; title: string }) {
  const embedUrl = youtubeEmbedUrl(url);
  if (!embedUrl) {
    return null;
  }

  return (
    <iframe
      src={embedUrl}
      title={title}
      className="aspect-video w-full rounded-[1.5rem] border border-white/10 bg-black shadow-2xl"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function spotifyEmbedUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("spotify.com")) {
      return null;
    }
    const path = parsed.pathname.replace(/^\/embed\//, "/");
    return `https://open.spotify.com/embed${path}`;
  } catch {
    return null;
  }
}

function TextSection({
  section,
  children,
}: {
  section: LandingPageSection;
  children?: ReactNode;
}) {
  return (
    <section id={section.id} className={sectionClassName(section)}>
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
          {section.bullets.length ? (
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
          ) : null}
          {section.linkUrl ? (
            <a
              href={section.linkUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-full bg-graphite-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-graphite-accent-hover"
            >
              Otevřít odkaz
            </a>
          ) : null}
        </div>
        {children ?? <MusicIllustration section={section} />}
      </div>
    </section>
  );
}

function MusicIllustration({ section }: { section: LandingPageSection }) {
  if (section.imageUrl) {
    return (
      <div className="relative min-h-72 overflow-hidden rounded-[2rem] border border-white/10 bg-graphite-surface shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={section.imageUrl} alt={section.title} className="h-full min-h-72 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/45 via-transparent to-graphite-accent/20" />
      </div>
    );
  }

  return (
    <div className="relative grid min-h-72 place-items-center overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-graphite-accent/20 via-white/5 to-black/30 p-8 shadow-2xl">
      <div className="absolute left-8 top-8 h-28 w-28 rounded-full border border-white/10" />
      <div className="absolute bottom-8 right-10 h-32 w-32 rounded-full bg-graphite-accent/20 blur-2xl" />
      <div className="relative rounded-[2rem] border border-white/10 bg-graphite-bg/75 px-8 py-7 text-center shadow-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-graphite-accent">
          Music
        </p>
        <p className="mt-3 text-3xl font-medium">kytara + song</p>
        <p className="mt-2 text-sm text-graphite-muted">osobní hudební prostor</p>
      </div>
    </div>
  );
}

export default async function MusicPage() {
  const content = await getLandingPageContent("hudba");
  const band = findSection(content, "zakazane-ovoce");
  const bio = findSection(content, "bio");
  const spotify = findSection(content, "spotify");
  const videos = findSection(content, "videoklipy");
  const photos = findSection(content, "fotky");
  const spotifyUrl = spotifyEmbedUrl(spotify?.linkUrl);
  const photoUrls = (photos?.galleryImageUrls ?? []).slice(0, 3);

  return (
    <div className="min-h-full bg-graphite-bg text-graphite-text">
      <PublicHeader />

      <section className="relative overflow-hidden bg-gradient-to-br from-graphite-surface via-graphite-bg to-black pb-20 pt-16 sm:pb-24 sm:pt-24">
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-graphite-accent/20 blur-3xl" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-center">
          <div className="relative">
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
                href="#spotify"
                className="rounded-full border border-graphite-border px-5 py-3 text-sm font-medium text-graphite-text transition hover:border-graphite-accent hover:text-graphite-accent"
              >
                {content.hero.secondaryLabel}
              </a>
            </div>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-[2rem] border border-white/10 bg-graphite-surface shadow-2xl">
            {content.hero.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.hero.imageUrl}
                alt={content.hero.title}
                className="h-full min-h-80 w-full object-cover"
              />
            ) : (
              <div className="grid min-h-80 place-items-center bg-gradient-to-br from-graphite-accent/25 via-white/5 to-transparent p-8 text-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-graphite-accent">
                    Promo photo
                  </p>
                  <p className="mt-3 text-3xl font-medium">fotka z adminu</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-graphite-accent/15" />
          </div>
        </div>
      </section>

      <MiniNav content={content} />

      {band ? <TextSection section={band} /> : null}
      {bio ? <TextSection section={bio} /> : null}

      {spotify ? (
        <section id={spotify.id} className={sectionClassName(spotify)}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-graphite-accent">
                {spotify.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-5xl">
                {spotify.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-graphite-muted">{spotify.text}</p>
            </div>
            <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-white/10 bg-black shadow-2xl">
              {spotifyUrl ? (
                <iframe
                  src={spotifyUrl}
                  title={spotify.title}
                  className="h-[352px] w-full"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
              ) : (
                <div className="grid h-64 place-items-center text-graphite-muted">
                  Doplň platnou Spotify URL v administraci.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {videos ? (
        <section id={videos.id} className={sectionClassName(videos)}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-graphite-accent">
                {videos.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-5xl">
                {videos.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-graphite-muted">{videos.text}</p>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {videos.bullets.slice(0, 3).map((url, index) => (
                <YoutubeEmbed
                  key={url}
                  url={url}
                  title={`${videos.title} ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {photos ? (
        <section id={photos.id} className={sectionClassName(photos)}>
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-graphite-accent">
                {photos.eyebrow}
              </p>
              <h2 className="mt-4 text-3xl font-medium tracking-tight sm:text-5xl">
                {photos.title}
              </h2>
              <p className="mt-5 text-lg leading-8 text-graphite-muted">{photos.text}</p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => {
                const url = photoUrls[index];
                return (
                  <div
                    key={url ?? index}
                    className="aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-white/10 bg-graphite-surface shadow-2xl"
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={url}
                        alt={`${photos.title} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center bg-gradient-to-br from-graphite-accent/20 via-white/5 to-black/20 p-6 text-center text-graphite-muted">
                        Fotka {index + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section id="kontakt" className="bg-graphite-surface/70 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-graphite-accent">
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
            className="mt-8 inline-flex rounded-full bg-graphite-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-graphite-accent-hover"
          >
            {content.cta.buttonLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
