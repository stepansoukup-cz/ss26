import "server-only";
import { prisma } from "@/lib/prisma";

export type LandingPageSlug = "webove-aplikace" | "nahravani" | "hudba";

export type LandingPageSection = {
  id: string;
  navLabel: string;
  icon: string;
  eyebrow: string;
  title: string;
  text: string;
  bullets: string[];
  imageUrl: string | null;
  linkUrl?: string | null;
  galleryImageUrls?: string[];
  illustration: string;
  reverse?: boolean;
  tone?: "dark" | "surface";
};

export type LandingPageReferenceBlock = {
  eyebrow: string;
  title: string;
  text: string;
  items: string[];
};

export type LandingPageCta = {
  eyebrow: string;
  title: string;
  text: string;
  buttonLabel: string;
};

export type LandingPageContent = {
  hero: {
    eyebrow: string;
    title: string;
    text: string;
    primaryLabel: string;
    secondaryLabel: string;
    imageUrl?: string | null;
  };
  sections: LandingPageSection[];
  references: LandingPageReferenceBlock;
  cta: LandingPageCta;
};

export const landingPageLabels: Record<LandingPageSlug, string> = {
  "webove-aplikace": "Webové aplikace",
  nahravani: "Studio / nahrávání",
  hudba: "Hudba",
};

export const defaultLandingPages: Record<LandingPageSlug, LandingPageContent> = {
  "webove-aplikace": {
    hero: {
      eyebrow: "Webové aplikace",
      title: "Webové aplikace od nápadu po hotový provoz.",
      text: "Stavím weby, administrace a aplikace, které nejsou jen vitrína. Mají workflow, data, přihlášení, napojení na služby a jasný smysl.",
      primaryLabel: "Poptat webovou aplikaci",
      secondaryLabel: "Ukázky a reference",
    },
    sections: [
      {
        id: "aplikace",
        navLabel: "Aplikace",
        icon: "app",
        eyebrow: "Aplikace na míru",
        title: "Interaktivní systémy, které dělají práci za tebe.",
        text: "Firemní intranety, administrace, katalogy, poptávkové formuláře, interní workflow nebo specializované nástroje. V PHP/Nette umím postavit stabilní aplikaci, která sedí přesně na proces.",
        bullets: ["PHP / Nette", "databáze", "admin", "workflow", "integrace"],
        imageUrl: null,
        illustration: "dashboard",
      },
      {
        id: "frontend",
        navLabel: "Frontend",
        icon: "frontend",
        eyebrow: "Moderní frontend",
        title: "Next.js, React a Tailwind pro rychlé moderní weby.",
        text: "Kde dává smysl současný stack, používám Next.js, React a Tailwind. Hodí se pro rychlé landing pages, obsahové weby, klientské zóny i hybridní aplikace s API a server actions.",
        bullets: ["Next.js", "React", "Tailwind", "API", "performance"],
        imageUrl: null,
        illustration: "code",
        reverse: true,
        tone: "surface",
      },
      {
        id: "design",
        navLabel: "Grafika",
        icon: "design",
        eyebrow: "Kompletní dodání",
        title: "Kód, grafika i logo v jednom konzistentním směru.",
        text: "Nemusíš dodávat hotový design. Umím připravit vizuální směr, základní identitu, grafické prvky i nové logo tak, aby web působil jednotně a šel dál rozvíjet.",
        bullets: ["HTML", "CSS", "Bootstrap", "UI", "logo", "responzivita"],
        imageUrl: null,
        illustration: "brand",
      },
    ],
    references: {
      eyebrow: "Reference",
      title: "Projekty, kde se řešily weby, aplikace i provoz.",
      text: "Některé projekty jsou veřejné weby, jiné interní systémy. Společné mají to, že za nimi není jen šablona, ale konkrétní potřeba.",
      items: [
        "nejlepsikapely.cz",
        "intranet Davo Car",
        "zakazanyovoce.cz",
        "neuroll.cz",
        "eft-danielavojtova.cz",
      ],
    },
    cta: {
      eyebrow: "Kontakt",
      title: "Máš projekt, který potřebuje rozhýbat?",
      text: "Napiš stručně, co potřebuješ postavit, opravit nebo propojit. Navrhneme technické řešení i realistický další krok.",
      buttonLabel: "Přejít na kontaktní formulář",
    },
  },
  nahravani: {
    hero: {
      eyebrow: "Nahrávání / produkce / mix",
      title: "Uděláme muziku. Od první myšlenky po finální master.",
      text: "Máš kapelu a hotové songy? Nahrajeme. Máš jen nápad? Vymyslíme produkci. Nehraješ na nic? I tak z toho může vzniknout hotová skladba.",
      primaryLabel: "Poptat nahrávání",
      secondaryLabel: "Vybavení studia",
    },
    sections: [
      {
        id: "song",
        navLabel: "Song",
        icon: "song",
        eyebrow: "Kompletní song",
        title: "Jseš kapela, máš nazkoušeno? Nahrajeme to pořádně.",
        text: "Můžeš přijít s hotovou skladbou, aranží a jasnou představou. Uděláme náběry, vybereme zvuky, pohlídáme výkon a dostaneme nápad do podoby, která obstojí mimo zkušebnu.",
        bullets: ["kapely", "kytary", "basa", "zpěv", "bicí", "aranž"],
        imageUrl: null,
        illustration: "wave",
      },
      {
        id: "studio",
        navLabel: "Studio",
        icon: "studio",
        eyebrow: "Produkce",
        title: "Nemáš hotovo? Vymyslíme, zahrajeme, postavíme.",
        text: "Když máš jen riff, text, melodii nebo náladu, dá se z toho udělat song. A když neumíš hrát na nic, pořád můžeme postavit hudbu, naprogramovat bicí, nahrát nástroje a dotáhnout produkci.",
        bullets: ["produkce", "aranže", "programování bicích", "demo", "song od nuly"],
        imageUrl: null,
        illustration: "drums",
        reverse: true,
        tone: "surface",
      },
      {
        id: "mix",
        navLabel: "Mix + mastering",
        icon: "mix",
        eyebrow: "Mix + mastering",
        title: "Tvoje stopy můžou znít hotově, ne jen nahlas.",
        text: "Můžeš dodat vlastní nahrané stopy a řešit jen mix a mastering. Nebo nahrajeme komplet song u mě. Anebo uděláme jen čisté náběry bez mixu a masteringu, pokud chceš dál pracovat jinde.",
        bullets: ["mix", "mastering", "náběry stop", "reamping", "editace", "exporty"],
        imageUrl: null,
        illustration: "console",
      },
      {
        id: "vybava",
        navLabel: "Výbava",
        icon: "gear",
        eyebrow: "Studio / výbava",
        title: "Mikrofony, hardware, pluginy a workflow pro reálnou práci.",
        text: "Nejde o vitrínu značek. Důležité je rychle najít zvuk, který sedí skladbě, muzikantovi a výsledku, který má nahrávka mít.",
        bullets: [
          "14 stop současně",
          "Neumann",
          "Shure",
          "Sennheiser",
          "Lewitt",
          "AKG",
          "sE Electronics",
          "Universal Audio",
          "Warm Audio",
          "UAD Ox Box",
          "Superior Drummer 3",
          "FabFilter",
          "UAD pluginy",
          "Cubase 14",
        ],
        imageUrl: null,
        illustration: "console",
        tone: "surface",
      },
    ],
    references: {
      eyebrow: "Možnosti spolupráce",
      title: "Od náběrů po kompletní produkci.",
      text: "Můžeme řešit jen stopáž, jen mix, kompletní nahrávku, nebo produkci od nápadu po hotový export.",
      items: ["komplet song u mě", "mix + mastering tvých stop", "jen náběry bez mixu", "produkce od nuly"],
    },
    cta: {
      eyebrow: "Kontakt",
      title: "Máš song, kapelu nebo jen nápad?",
      text: "Napiš, v jaké fázi hudba je, co chceš nahrát a jaký výsledek si představuješ. Domluvíme nejrozumnější cestu.",
      buttonLabel: "Přejít na kontaktní formulář",
    },
  },
  hudba: {
    hero: {
      eyebrow: "Hudba",
      title: "Štěpán Soukup. Kytara, songy a vlastní hudební svět.",
      text: "Muzikant, kytarista a autor, který se pohybuje mezi kapelovým pódiem, studiovou prací a vlastní tvorbou.",
      primaryLabel: "Napsat přes kontakt",
      secondaryLabel: "Poslechnout na Spotify",
      imageUrl: null,
    },
    sections: [
      {
        id: "zakazane-ovoce",
        navLabel: "Zakázané ovoce",
        icon: "guitar",
        eyebrow: "Kapela",
        title: "Jsem kytarista kapely Zakázané ovoce.",
        text: "Tahle stránka je rozcestník k mojí osobní hudební části. Kompletní informace o kapele najdeš přímo na webu Zakázaného ovoce.",
        bullets: ["kytara", "kapela", "koncerty"],
        imageUrl: null,
        linkUrl: "https://www.zakazanyovoce.cz",
        illustration: "guitar",
      },
      {
        id: "bio",
        navLabel: "Bio",
        icon: "bio",
        eyebrow: "Bio",
        title: "Stručně o muzice, která mě drží dlouhodobě.",
        text: "Hudba je pro mě přirozené místo mezi energií kapely, prací se zvukem a hledáním vlastního výrazu. Nejvíc mě baví songy, které mají tah, emoci a poctivě zahraný základ.",
        bullets: ["kytara", "songwriting", "studio", "produkce"],
        imageUrl: null,
        illustration: "portrait",
        reverse: true,
        tone: "surface",
      },
      {
        id: "spotify",
        navLabel: "Spotify",
        icon: "spotify",
        eyebrow: "Spotify",
        title: "Poslech na Spotify.",
        text: "Profil, nahrávky a aktuální hudební stopa na jednom místě.",
        bullets: ["profil", "streaming", "hudba"],
        imageUrl: null,
        linkUrl: "https://open.spotify.com/artist/7j2wWAmjvEG0IQz7WEIcQf",
        illustration: "spotify",
      },
      {
        id: "videoklipy",
        navLabel: "Videoklipy",
        icon: "video",
        eyebrow: "Videoklipy",
        title: "Tři videoklipy v jednom přehledu.",
        text: "Výběr klipů z YouTube. URL můžeš v administraci kdykoliv vyměnit.",
        bullets: [
          "https://www.youtube.com/watch?v=rbCGfRVWZBQ",
          "https://www.youtube.com/watch?v=nBJnMTlIDj4",
          "https://www.youtube.com/watch?v=lp2_G51ErIY",
        ],
        imageUrl: null,
        illustration: "video",
        tone: "surface",
      },
      {
        id: "fotky",
        navLabel: "Fotky",
        icon: "photo",
        eyebrow: "Fotky",
        title: "Promo fotky a momenty s kytarou.",
        text: "Malá galerie pro promo fotky, koncertní náladu nebo studiové momenty. V administraci můžeš nahrát až tři fotky přes Cloudinary.",
        bullets: ["kytara", "promo", "studio"],
        imageUrl: null,
        galleryImageUrls: [],
        illustration: "photos",
      },
    ],
    references: {
      eyebrow: "Rozcestník",
      title: "Hudba na jednom místě.",
      text: "Kapela má vlastní web, osobní profil zase vlastní poslech, klipy a kontakt.",
      items: ["Zakázané ovoce", "Spotify", "YouTube", "Kontakt"],
    },
    cta: {
      eyebrow: "Kontakt",
      title: "Chceš se domluvit na koncertu, spolupráci nebo nahrávání?",
      text: "Napiš přes kontaktní formulář. Vyber správný předmět a přidej pár vět k tomu, o co jde.",
      buttonLabel: "Přejít na kontaktní formulář",
    },
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : fallback;
}

function normalizeContent(slug: LandingPageSlug, raw: unknown): LandingPageContent {
  const fallback = defaultLandingPages[slug];
  if (!isObject(raw)) {
    return fallback;
  }

  const hero = isObject(raw.hero) ? raw.hero : {};
  const references = isObject(raw.references) ? raw.references : {};
  const cta = isObject(raw.cta) ? raw.cta : {};
  const sections = Array.isArray(raw.sections) ? raw.sections : [];

  return {
    hero: {
      eyebrow: asString(hero.eyebrow, fallback.hero.eyebrow),
      title: asString(hero.title, fallback.hero.title),
      text: asString(hero.text, fallback.hero.text),
      primaryLabel: asString(hero.primaryLabel, fallback.hero.primaryLabel),
      secondaryLabel: asString(hero.secondaryLabel, fallback.hero.secondaryLabel),
      imageUrl:
        typeof hero.imageUrl === "string" && hero.imageUrl.trim()
          ? hero.imageUrl.trim()
          : (fallback.hero.imageUrl ?? null),
    },
    sections: fallback.sections.map((fallbackSection, index) => {
      const section = isObject(sections[index]) ? sections[index] : {};
      return {
        ...fallbackSection,
        eyebrow: asString(section.eyebrow, fallbackSection.eyebrow),
        title: asString(section.title, fallbackSection.title),
        text: asString(section.text, fallbackSection.text),
        bullets: asStringArray(section.bullets, fallbackSection.bullets),
        imageUrl:
          typeof section.imageUrl === "string" && section.imageUrl.trim()
            ? section.imageUrl.trim()
            : null,
        linkUrl:
          typeof section.linkUrl === "string" && section.linkUrl.trim()
            ? section.linkUrl.trim()
            : (fallbackSection.linkUrl ?? null),
        galleryImageUrls: asStringArray(
          section.galleryImageUrls,
          fallbackSection.galleryImageUrls ?? [],
        ).slice(0, 3),
      };
    }),
    references: {
      eyebrow: asString(references.eyebrow, fallback.references.eyebrow),
      title: asString(references.title, fallback.references.title),
      text: asString(references.text, fallback.references.text),
      items: asStringArray(references.items, fallback.references.items),
    },
    cta: {
      eyebrow: asString(cta.eyebrow, fallback.cta.eyebrow),
      title: asString(cta.title, fallback.cta.title),
      text: asString(cta.text, fallback.cta.text),
      buttonLabel: asString(cta.buttonLabel, fallback.cta.buttonLabel),
    },
  };
}

export async function getLandingPageContent(slug: LandingPageSlug) {
  const page = await prisma.landingPageContent.findUnique({
    where: { slug },
  });
  return normalizeContent(slug, page?.content);
}
