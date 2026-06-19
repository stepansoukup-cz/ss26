import Link from "next/link";
import { getSiteSettings } from "@/lib/site-settings";
import { PublicHeaderNav } from "@/components/site/PublicHeaderNav";

const socialLinks = [
  ["facebookUrl", "Facebook", "facebook"],
  ["instagramUrl", "Instagram", "instagram"],
  ["spotifyUrl", "Spotify", "spotify"],
  ["youtubeUrl", "YouTube", "youtube"],
  ["tiktokUrl", "TikTok", "tiktok"],
] as const;

export async function PublicHeader() {
  const settings = await getSiteSettings();
  const socialItems = socialLinks.map(([key, label, icon]) => ({
    key,
    label,
    icon,
    href: settings[key],
  }));

  return (
    <header className="border-b border-graphite-border bg-graphite-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="inline-flex items-center gap-3">
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt={settings.siteName}
              className="h-10 w-auto max-w-48 object-contain"
            />
          ) : (
            <span className="text-base font-medium tracking-tight text-graphite-text">
              {settings.siteName}
            </span>
          )}
        </Link>
        <PublicHeaderNav socialLinks={socialItems} />
      </div>
    </header>
  );
}
