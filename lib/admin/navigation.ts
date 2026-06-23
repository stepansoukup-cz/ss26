export type AdminNavItem = {
  href: string;
  label: string;
  icon: "articles" | "settings" | "profile" | "tags" | "comments" | "messages" | "pages" | "gear" | "gigs";
  /** Aktivní i na podstránkách, např. /admin/clanky/novy */
  matchPrefix?: boolean;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

/**
 * Jediný zdroj pravdy pro sidebar administrace.
 * Novou položku (CRUD, modul) přidej sem — objeví se v menu automaticky.
 */
export const adminNavSections: AdminNavSection[] = [
  {
    title: "Obsah",
    items: [
      { href: "/admin/clanky", label: "Články", icon: "articles", matchPrefix: true },
      { href: "/admin/landing-pages", label: "Landing pages", icon: "pages", matchPrefix: true },
      { href: "/admin/gear", label: "Gear", icon: "gear", matchPrefix: true },
      { href: "/admin/koncerty", label: "Koncerty", icon: "gigs", matchPrefix: true },
      // { href: "/admin/stitky", label: "Štítky", icon: "tags", matchPrefix: true },
      // { href: "/admin/komentare", label: "Komentáře", icon: "comments", matchPrefix: true },
    ],
  },
  {
    title: "Systém",
    items: [
      { href: "/admin/zpravy", label: "Zprávy z formuláře", icon: "messages", matchPrefix: true },
      { href: "/admin/nastaveni-webu", label: "Nastavení webu", icon: "settings" },
      { href: "/admin/profil", label: "Můj profil", icon: "profile" },
    ],
  },
];
