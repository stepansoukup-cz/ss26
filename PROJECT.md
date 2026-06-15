# [PROJECT.md](http://PROJECT.md) — specifikace webu [stepansoukup.cz](http://stepansoukup.cz)

> Tohle je **trvalá specifikace projektu**. Drž se jí u všech úkolů. Je to „co stavíme a jak to má vypadat". Když něco není v tomto dokumentu rozhodnuté, zeptej se — nedomýšlej si.

---

## 1. Cíl a charakter projektu

Osobní web veřejně známé osoby (muzikant + vývojář + zvukové studio). **Dominantou webu je blog.**

Tři profesní roviny majitele:

- **Hudba** — kytarista kapely + sólová dráha.
- **Programování** — tvorba webů (dříve Nette, nově Next.js).
- **Studio** — recording, mix, mastering, hudební produkce.

Web je zároveň **učební projekt** (první projekt majitele v Next.js). Proto: stavět **po malých krocích**, vše srozumitelně vysvětlovat, nezaplevelovat zbytečnou složitostí.

## 2. Zásady soukromí (DŮLEŽITÉ)

- **Nikde ve veřejném HTML nesmí být e-mail ani telefon.** Kontakt jde výhradně přes **kontaktní formulář**.
- Formulář ukládá zprávu do databáze a posílá notifikaci na soukromý e-mail majitele (přes Resend) — ten e-mail se nikde nezobrazuje.
- Tajné klíče (DB, Cloudinary, Resend, Auth) jen v env proměnných, nikdy v kódu ani v Gitu.

## 3. Tech stack


| Vrstva                      | Volba                                                        |
| --------------------------- | ------------------------------------------------------------ |
| Framework                   | Next.js 16 (App Router, TypeScript, Tailwind CSS, Turbopack) |
| Styly                       | Tailwind CSS                                                 |
| Databáze                    | Neon Postgres                                                |
| ORM                         | Prisma 6 (klient importovat z `@/lib/prisma`)                |
| Přihlašování                | Auth.js (NextAuth v5)                                        |
| Média (obrázky/audio/video) | Cloudinary                                                   |
| Odesílání mailu (formulář)  | Resend                                                       |
| Editor článků (admin)       | Tiptap                                                       |
| Hosting                     | Vercel                                                       |


> Pozn.: Prisma zůstává na verzi 6 (verze 7 mění konfiguraci `url`/`directUrl`). Neupgradovat bez výslovného pokynu.

## 4. Vizuální styl

- **Tmavý „grafitový" vzhled** jako výchozí: pozadí ~`#1b1b1f`, plochy ~`#26262b`, text ~`#e7e7ea`, jeden akcentní tón.
- Minimalismus, hodně prostoru, čisté řezy.
- **Cover médií vždy v poměru 16:9** (obrázek i video).
- **Vlastní SVG ikony** přes komponentu `<Icon name="..." />`. ŽÁDNÁ knihovna ikon (ne FontAwesome). SVG používají `currentColor` a dědí velikost.
- Typografie: jedno čisté bezpatkové písmo na UI, případně výraznější na nadpisy.
- Responzivní (mobil first kde to jde).

## 5. Layout a menu

Hlavička = lišta na grafitovém podkladu: **10 ikon + logo uprostřed**, rozdělení 5 vlevo / logo / 5 vpravo.

**Vlevo (5) — pohyb po webu + kontakt:**

1. Hudba → `/hudba` (ikona: noty)
2. Programování → `/programovani` (ikona: `</>`)
3. Studio → `/studio` (ikona: waveform)
4. Blog → `/` (ikona: noviny)
5. Kontakt (ikona: obálka) → otevře kontaktní formulář jako **modal** (fallback odkaz `/kontakt`)

**Uprostřed:** logo webu.

**Vpravo (5) — externí platformy (nová záložka):** Facebook, Instagram, YouTube, Spotify, TikTok.

Pod hlavičkou jde **rovnou obsah** — žádný slider/hero carousel.

## 6. Mapa webu (sitemap)

```
/                     → DOMOVSKÁ = BLOG (nejnovější článek dominantní 16:9 + výpis + filtr štítků)
/blog/[slug]          → detail článku
/blog/stitek/[stitek] → výpis článků pro daný štítek
/hudba                → kapela + sólo dráha
/programovani         → landing page
/studio               → landing page (recording / mix / master / produkce)
/kontakt              → kontaktní formulář (i jako modal z ikony obálky)
/admin                → administrace (chráněné přihlášením)
/admin/clanky         → CRUD článků
/admin/stitky         → CRUD štítků
/admin/komentare      → moderace diskuse
/admin/zpravy         → příchozí zprávy z formuláře

— budoucí (zatím nestavět) —
/koncerty, /gear, /fanklub, /admin/* (fakturace, kalorické tabulky, finance, file-transfer)

```

## 7. Popis stránek

`/` **Domovská = Blog**

- Nahoře **dominantní nejnovější článek** (cover 16:9 — obrázek nebo video — + titulek + perex + štítky).
- Pod ním výpis dalších článků (karty: cover 16:9, titulek, perex, štítky, datum).
- **Filtr podle štítků** (klikací štítky). Článek může mít více štítků.
- Stránkování při větším počtu článků.

`/blog/[slug]` **Detail článku**

- Pořadí: cover 16:9 → perex → obsah (text + vložené obrázky/videa) → **galerie** (mřížka obrázků) → **audio přehrávač** (zvukové ukázky) → štítky → **diskuse** (komentáře, vlákna).

`/hudba`

- Sekce 1 (hned navrchu): „hlavně kytarista kapely **Zakázané ovoce**" + odkaz na web kapely.
- Sekce 2: **sólová dráha** — bio, stručná historie kapely, embed YouTube klip, pár fotek, Spotify embed přehrávač.
- Spíš stručné, vizuálně oddělené sekce.

`/programovani` a `/studio`

- Klasické **landing pages** s graficky oddělenými sekcemi (hero, co dělám, ukázky/služby, CTA na kontaktní modal). Studio = recording / mix / mastering / produkce.

`/kontakt`

- Formulář: jméno, e-mail odesílatele, předmět, zpráva, anti-spam (honeypot). Uloží do DB + pošle notifikaci přes Resend. E-mail majitele se NIKDE veřejně neobjeví. Stejná komponenta umí vyskočit jako modal z ikony obálky.

## 8. Administrace (`/admin`)

Za přihlášením (Auth.js, role ADMIN/EDITOR). Obsahuje:

- Dashboard (počty článků, nepřečtené zprávy, čekající komentáře).
- Články — CRUD (Tiptap editor, cover/galerie/audio přes Cloudinary, publikovat/skrýt, štítky).
- Štítky — CRUD.
- Komentáře — moderace (schválit / spam / smazat).
- Zprávy z formuláře — čtení, označení přečteno.

## 9. Datový model (databáze)

Tabulky už existují v databázi (Prisma 6, Postgres/Neon). Klient importovat z `@/lib/prisma`.

**Enumy:** `Role` (ADMIN, EDITOR, FAN) · `CoverType` (IMAGE, VIDEO) · `ArticleStatus` (DRAFT, PUBLISHED) · `MediaType` (IMAGE, AUDIO, VIDEO) · `CommentStatus` (PENDING, APPROVED, SPAM).

- **User**: id, email (unikátní), name, passwordHash, role (default ADMIN), createdAt. Relace: articles (1:N), comments (1:N).
- **Article**: id, slug (unikátní), title, perex (Text), content (Text, nullable), coverType (default IMAGE), coverImageUrl?, coverVideoUrl?, status (default DRAFT), publishedAt?, authorId (FK→User), createdAt, updatedAt. Relace: author, tags (přes ArticleTag), media (1:N), comments (1:N).
- **Tag**: id, name, slug (unikátní). Relace: articles (přes ArticleTag).
- **ArticleTag** (M:N): articleId (FK), tagId (FK), složený PK.
- **Media**: id, articleId (FK→Article), type (MediaType), url, publicId, caption?, position (default 0), createdAt.
- **Comment**: id, articleId (FK→Article), authorId? (FK→User), authorName?, body (Text), parentId? (self-relace, vlákna), status (default PENDING), createdAt.
- **ContactMessage**: id, name, email, subject?, body (Text), read (default false), createdAt.

## 10. Budoucí moduly (zatím NESTAVĚT, jen evidence)

Koncerty (`Concert`) · Gear (`GearItem`) · Fanklub (rozšíření User o roli FAN + profil) · File transfer à la WeTransfer jen pro majitele · Admin nástroje převzaté z Nette: fakturace, kalorické tabulky, správa financí. Každý modul až na samostatný pokyn.

---

## 11. Jak pracovat na tomto projektu (pravidla pro agenta)

- **Dělej malé kroky.** Jeden úkol = jedna ucelená změna. Neprováděj víc nesouvisejících věcí naráz.
- **Vždy stručně vysvětli, co a proč jsi změnil**, a které soubory.
- **Neměň víc souborů, než je pro úkol nutné.** Nepřepisuj nesouvisející kód.
- **Žádné tajné klíče v kódu** — vždy přes env proměnné.
- **Prisma klient** importuj z `@/lib/prisma` (nevytvářej nové instance PrismaClient).
- **Drž grafitový tmavý styl** a vlastní `<Icon />` komponentu (žádná knihovna ikon).
- **V terminálu nic nespouštěj sám**, pokud o to nejsi výslovně požádán — místo toho mi napiš, jaký příkaz mám spustit.
- Když je zadání nejasné nebo něco není v tomto dokumentu rozhodnuté, **zeptej se**, nedomýšlej si.
- Majitel je začátečník v Next.js — preferuj srozumitelná, čitelná řešení před „chytrými" zkratkami.

---

*Tento soubor je zdroj pravdy o podobě webu. Postup instalace/nasazení (terminál, Vercel, účty) sem nepatří — ten řeší majitel mimo projekt.*