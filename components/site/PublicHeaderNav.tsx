"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SocialLink = {
  key: string;
  href: string | null;
  label: string;
  icon: string;
};

function HeaderIcon({ type }: { type: string }) {
  const common = {
    className: "h-7 w-7",
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true,
  };

  switch (type) {
    case "facebook":
      return (
        <svg {...common}>
          <path d="M14.2 8.1h2.4V4.2c-.4-.1-1.8-.2-3.4-.2-3.4 0-5.7 2.1-5.7 6v3.4H4v4.4h3.5V24h4.4v-6.2h3.5l.6-4.4h-4.1v-3c0-1.3.4-2.3 2.3-2.3Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm4.2 3.6A4.4 4.4 0 1 1 12 16.4a4.4 4.4 0 0 1 0-8.8Zm0 2A2.4 2.4 0 1 0 12 14.4a2.4 2.4 0 0 0 0-4.8Zm4.65-2.85a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1Z" />
        </svg>
      );
    case "spotify":
      return (
        <svg {...common}>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.4a.72.72 0 0 1-1 .25c-2.74-1.67-6.18-2.05-10.24-1.12a.73.73 0 0 1-.32-1.42c4.45-1.02 8.27-.58 11.31 1.27.34.2.45.66.25 1.02Zm1.34-2.98a.9.9 0 0 1-1.24.3c-3.14-1.93-7.93-2.49-11.64-1.36a.9.9 0 1 1-.52-1.72c4.24-1.29 9.51-.67 13.1 1.53.42.26.56.82.3 1.25Zm.12-3.1C14.3 8.08 8.1 7.88 4.52 8.97a1.08 1.08 0 0 1-.63-2.07c4.1-1.24 10.94-1 15.27 1.58a1.08 1.08 0 1 1-1.1 1.85Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common}>
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.55 3.58 12 3.58 12 3.58s-7.55 0-9.4.5A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.85.5 9.4.5 9.4.5s7.55 0 9.4-.5a3 3 0 0 0 2.1-2.12A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8ZM9.6 15.57V8.43L15.86 12 9.6 15.57Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M16.55 5.85A6.12 6.12 0 0 0 20 7.04v3.5a9.55 9.55 0 0 1-3.63-.72v6.56A5.62 5.62 0 1 1 10.75 10.8c.32 0 .63.03.93.08v3.56a2.12 2.12 0 1 0 1.45 2.02V2h3.42v3.85Z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <path d="M3.5 5h17A2.5 2.5 0 0 1 23 7.5v9A2.5 2.5 0 0 1 20.5 19h-17A2.5 2.5 0 0 1 1 16.5v-9A2.5 2.5 0 0 1 3.5 5Zm.35 2 8.15 5.7L20.15 7H3.85Zm17.15 2.18-8.43 5.9a1 1 0 0 1-1.14 0L3 9.18v7.32c0 .28.22.5.5.5h17a.5.5 0 0 0 .5-.5V9.18Z" />
        </svg>
      );
    default:
      return null;
  }
}

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/blog/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function textClassName(active: boolean) {
  return `transition ${active ? "text-white" : "hover:text-white"}`;
}

function iconClassName(active: boolean) {
  return `inline-flex h-11 w-11 items-center justify-center transition ${
    active ? "text-white" : "text-graphite-muted hover:text-white"
  }`;
}

export function PublicHeaderNav({ socialLinks }: { socialLinks: SocialLink[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Hlavní navigace"
      className="flex flex-wrap items-center gap-x-5 gap-y-2 text-base font-medium text-graphite-muted"
    >
      <Link href="/" className={textClassName(isActive(pathname, "/"))}>
        Blog
      </Link>
      <Link
        href="/webove-aplikace"
        className={textClassName(isActive(pathname, "/webove-aplikace"))}
      >
        Webové aplikace
      </Link>
      <Link
        href="/nahravani"
        className={textClassName(isActive(pathname, "/nahravani"))}
      >
        Studio
      </Link>
      {socialLinks.map((item) => {
        if (!item.href) {
          return null;
        }
        return (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            aria-label={item.label}
            title={item.label}
            className={iconClassName(false)}
          >
            <HeaderIcon type={item.icon} />
          </a>
        );
      })}
      <Link
        href="/kontakt"
        aria-label="Kontakt"
        title="Kontakt"
        className={iconClassName(isActive(pathname, "/kontakt"))}
      >
        <HeaderIcon type="mail" />
      </Link>
    </nav>
  );
}
