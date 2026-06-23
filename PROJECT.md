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
| Přihlašování                | Vlastní DB-session auth (jose JWT v cookie + bcrypt, session v DB) |
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
/gear                 → výpis gearu
/gear/[id]            → detail gearu
/koncerty             → výpis koncertů
/kontakt              → kontaktní formulář (i jako modal z ikony obálky)
/admin                → administrace (chráněné přihlášením)
/admin/clanky         → CRUD článků
/admin/stitky         → CRUD štítků
/admin/zpravy         → příchozí zprávy z formuláře
/admin/gear           → CRUD gearu a soukromých údajů
/admin/koncerty       → CRUD koncertů a přiřazení gearu

— budoucí (zatím nestavět) —
/fanklub, /admin/* (fakturace, kalorické tabulky, finance, file-transfer)

```

## 7. Popis stránek

`/` **Domovská = Blog**

- Nahoře **dominantní nejnovější článek** (cover 16:9 — obrázek nebo video — + titulek + perex + štítky).
- Pod ním výpis dalších článků (karty: cover 16:9, titulek, perex, štítky, datum).
- **Filtr podle štítků** (klikací štítky). Článek může mít více štítků.
- Stránkování při větším počtu článků.

`/blog/[slug]` **Detail článku**

- Pořadí: cover 16:9 → perex → **obsah** (Tiptap JSON: text + vložené bloky) → štítky. (**Diskuse/komentáře pod články se NEIMPLEMENTUJÍ** — rozhodnuto neřešit, viz sekce 8.)
- **Obsah článku** se ukládá jako **Tiptap JSON dokument** (ne HTML). Text lze obohacovat o **vkládací bloky** — **galerie** a **přehrávač (audio)** lze vložit **kdekoli v textu**, včetně **více bloků stejného typu v jednom článku** (kombinace galerie + přehrávače). Pořadí bloků na stránce = pořadí v dokumentu.
- U článku se zobrazí **„Aktualizováno: datum“** z `updatedAt`, pokud se liší od `publishedAt` o více než cca jeden den.
- Článek může být i **recenze** (např. hudebního vybavení). Recenze sdílí stejnou strukturu jako běžný článek (cover, perex, obsah, štítky…), navíc má volitelná **hodnotící kritéria** — skóre 0–10:
  - `score_legacy` (legacy / „dědictví“ produktu),
  - `score_practicality` (praktičnost),
  - `score_price` (cena),
  - `score_sound` (zvuk),
  - `score_look` (vzhled).
  Všechna kritéria jsou **nullable** — vyplňuje se jen to, co dává u dané recenze smysl.
- **`score_overall` se do DB neukládá.** Počítá se vždy dynamicky jako **aritmetický průměr pouze z vyplněných kritérií**. Když není vyplněné žádné kritérium, rating se **nikde nezobrazuje** (ani na detailu, ani na kartě ve výpisu).
- Recenze může (ale nemusí) být propojená s jedním či více kusy **gearu** — viz budoucí modul Gear (sekce 10).

`/hudba`

- Landing page ve stejném onepage stylu jako Programování a Studio.
- Sekce: hero, **Zakázané ovoce** (jen rozcestník s odkazem na web kapely), bio, Spotify embed, tři YouTube videoklipy, galerie max. 3 fotek, CTA na kontakt.
- Obsah je editovatelný v adminu v sekci Landing pages jako třetí záložka **Hudba**.

`/programovani` a `/studio`

- Klasické **landing pages** s graficky oddělenými sekcemi (hero, co dělám, ukázky/služby, CTA na kontaktní modal). Studio = recording / mix / mastering / produkce.

`/kontakt`

- Formulář: jméno, e-mail odesílatele, předmět, zpráva, anti-spam (honeypot). Uloží do DB + pošle notifikaci přes Resend. E-mail majitele se NIKDE veřejně neobjeví. Stejná komponenta umí vyskočit jako modal z ikony obálky.

## 8. Administrace (`/admin`)

Za přihlášením (vlastní DB-session auth, role ADMIN/EDITOR). Obsahuje:

- Dashboard (počty článků, nepřečtené zprávy).
- Články — CRUD (Tiptap editor, cover/galerie/audio přes Cloudinary, publikovat/skrýt, štítky). U recenzí navíc volitelná hodnotící kritéria (skóre 0–10, viz sekce 7).
- Štítky — CRUD.
- Zprávy z formuláře — čtení, označení přečteno.
- Gear a koncerty — CRUD (viz sekce 10).

> **Komentáře/diskuse pod články se NEIMPLEMENTUJÍ.** Rozhodnuto neřešit (na osobním webu by šlo o minimální provoz a hlavně zdroj spamu). Tabulka `Comment` zůstává ve schématu jako nevyužitá (kdyby se rozhodnutí v budoucnu změnilo), ale žádné UI ani moderace se nestaví.

### Autentizace a relace

- Přihlášení používá **stateful session uložené v DB**. Cookie nese jen náhodný session token; v tabulce `Session` je uložený pouze jeho hash (`tokenHash`) plus `userId`, zařízení / user-agent, IP, `createdAt`, `lastSeenAt`, `expiresAt`. Umožňuje to trvalé přihlášení, vzdálené odhlášení konkrétního zařízení i všech ostatních relací a výpis aktivních přihlášení v admin profilu.
- **2FA při změně hesla** — vyžaduje (1) staré heslo a (2) jednorázový kód zaslaný na registrovaný e-mail přes Resend. Nové heslo se uloží až po ověření kódu; po úspěšné změně se ostatní relace odhlásí a aktuální relace zůstane.
- Poznámka: web je osobní, bez citlivých dat třetích stran. Bezpečnostní model tomu má být úměrný, ale správa relací a 2FA u změny hesla zůstávají důležitou součástí administrace.

## 9. Datový model (databáze)

Tabulky už existují v databázi (Prisma 6, Postgres/Neon). Klient importovat z `@/lib/prisma`.

**Enumy:** `Role` (ADMIN, EDITOR, FAN) · `CoverType` (IMAGE, VIDEO) · `ArticleStatus` (DRAFT, PUBLISHED) · `MediaType` (IMAGE, AUDIO, VIDEO) · `ContentBlockType` (GALLERY, AUDIO_PLAYER) · `CommentStatus` (PENDING, APPROVED, SPAM).

- **User**: id, email (unikátní), name, passwordHash, role (default ADMIN), createdAt. Relace: articles (1:N), comments (1:N), sessions (1:N).
- **PasswordChangeCode**: id, userId (FK→User, cascade delete), codeHash, pendingPasswordHash, attempts, expiresAt, usedAt?, createdAt. Slouží pro 2FA potvrzení změny hesla; nové heslo se do `User.passwordHash` uloží až po ověření kódu.
- **Session**: id, userId (FK→User, cascade delete), tokenHash (unikátní hash náhodného tokenu z cookie), userAgent?, ip?, createdAt, lastSeenAt, expiresAt.
- **Article**: id, slug (unikátní), title, perex (Text), **content (Text, nullable — Tiptap JSON)**, coverType (default IMAGE), coverImageUrl?, coverVideoUrl?, status (default DRAFT), publishedAt?, authorId (FK→User), createdAt, updatedAt. **Recenze** (volitelně): score_legacy?, score_practicality?, score_price?, score_sound?, score_look? (všechna Int 0–10, nullable). `score_overall` **není sloupec v DB** — počítá se za běhu z vyplněných kritérií. Relace: author, tags (přes ArticleTag), **contentBlocks** (1:N), media (1:N), comments (1:N), gear (přes ArticleGear, M:N — budoucí modul).
- **ContentBlock**: id, articleId (FK→Article), type (`GALLERY` | `AUDIO_PLAYER`), createdAt. Relace: article, media (1:N). Blok odpovídá vloženému uzlu v JSON (`galleryBlock`, `audioPlayerBlock`) přes `blockId`.
- **Tag**: id, name, slug (unikátní). Relace: articles (přes ArticleTag).
- **ArticleTag** (M:N): articleId (FK), tagId (FK), složený PK.
- **Media**: id, articleId (FK→Article), **blockId?** (FK→ContentBlock), type (MediaType), url, publicId, caption?, position (default 0, pořadí uvnitř bloku), createdAt.
- **Comment**: id, articleId (FK→Article), authorId? (FK→User), authorName?, body (Text), parentId? (self-relace, vlákna), status (default PENDING), createdAt. **(Tabulka existuje ve schématu, ale je NEVYUŽITÁ — komentáře se neimplementují, viz sekce 8.)**
- **ContactMessage**: id, name, email, subject?, body (Text), read (default false), createdAt.

## 10. Gear a koncerty

Modul **Gear + koncerty** je moderní evidence vybavení a koncertů. Nejde o 1:1 překlopení starého Nette kódu.

### Gear (`/gear`, `/admin/gear`)

Samostatná entita **`Gear`** s vlastními informacemi o kusu vybavení: značka, model, kategorie, poznámka, datum nákupu/prodeje, šuplík, cover obrázek, URL odkazy, URL veřejného inzerátu při prodeji, kontejner/pedalboard a skupina stejných kusů.

`listingUrl` (odkaz na veřejný inzerát) se zobrazuje veřejně jen u neprodaného gearu. Jakmile má gear vyplněné `soldAt`, `listingUrl` se při uložení vždy nastaví na `null` a na webu se nezobrazuje.

Soukromé údaje jsou v **`GearPrivateInfo`** (sériové číslo, ceny, kontakty prodejce/kupujícího). Tato tabulka je **admin-only** a veřejné stránky ji nesmí vůbec číst.

**Recenze (článek) a gear jsou dvě nezávislé entity.** Propojují se přes relační tabulku `ArticleGear`. Propojení je **volitelné a obousměrné**, ale jeden konkrétní gear může mít přiřazený **maximálně jeden** blog článek/recenzi; jeden článek může naopak odkazovat více kusů gearu:

- recenze **může, ale nemusí** odkazovat na jeden či více kusů gearu,
- gear **může, ale nemusí** mít navázanou jednu či více recenzí,
- na stránce/kartě gearu se zobrazí **jen prolink** na navázanou recenzi (odkaz na plný detail článku) — **obsah recenze se do karty gearu nenačítá ani neduplikuje**; stejně naopak gear na kartě recenze jen odkaz,
- **párování je ruční** v administraci přes vyhledávací našeptávač, ne přes dlouhý checkbox seznam,
- gear i recenzi musí jít vytvořit **nezávisle** (gear bez recenze, recenze bez gearu).

**Stejný model gearu vlastněný víckrát:** pokud majitel vlastní **více kusů stejného modelu** (např. tři stejné kytary), **nikdy se neslučují do jednoho záznamu** — každý kus je **samostatný záznam** s vlastní historií (nákup, koncerty, fotky…). Kusy stejného modelu lze volitelně **seskupit relací (grouping)**; statistiky (počet koncertů, dny vlastnictví…) se u skupiny **dynamicky sčítají** z členů, **přiřazená recenze se zobrazí u všech členů skupiny** (odkaz na stejný článek). Seskupení jde **kdykoli zrušit** — záznamy zůstanou, zmizí jen vazba skupiny.

**Kontejnery / pedalboardy:** `containerId` znamená, že kus je aktuálně součástí jiného kusu. `containerId` a `sameModelGroupId` jsou dvě různé nezávislé věci. Při smazání/prodeji kontejneru se obsah nesmí smazat; DB relace má `onDelete: SetNull`.

**Koncerty a statistiky:** koncerty se počítají výhradně z vlastních řádků `GearOnGig`. Při zaškrtnutí kontejneru u koncertu se zapíše vazba pro kontejner i pro každý jeho aktuální obsah zvlášť. Historické vazby se zpětně nepřepisují, když se později změní obsah pedalboardu. Počty koncertů ani dny vlastnictví se neukládají; počítají se dynamicky.

### Koncerty (`/koncerty`, `/admin/koncerty`)

`Gig` eviduje datum, město, místo, název akce/festivalu, kapelu, poznámku a odkazy na fotky, záznam nebo YouTube. Finance se sem neukládají. Gear se ke koncertům váže přes `GearOnGig`.

### Budoucí moduly (zatím nestavět)

Fanklub (rozšíření User o roli FAN + profil) · File transfer à la WeTransfer jen pro majitele · Admin nástroje převzaté z Nette: fakturace, kalorické tabulky, správa financí. Každý modul až na samostatný pokyn.

---

## 11. Připomínky (Reminders) — budoucí modul (zatím nestavět)

Jednoduchý osobní reminder v adminu: zadám událost a nechám si na ni poslat e-mailové upozornění předem. Doručení přes **Resend** (už v projektu). Staví se **později**, až poběží ostrý provoz (kvůli testování cronu).

**Zadávání (styl Google):**

- Pole: **text/zpráva**, **datum a čas události** (na minutu, např. 5. 3. 2026 9:31).
- **Čas upozornění** se zadává jako **odstup před událostí** (rozbalovák), ne jako absolutní čas: *v čas události* / *nejbližší celá hodina před* / *2 h* / *3 h* / *6 h* / *12 h* / *24 h* před. U každé volby se v UI ukáže **dopočítaný konkrétní čas**, ať uživatel vidí výsledek.
- **Default** po vyplnění času události: `notifyAt` = čas události **zaokrouhlený dolů na celou hodinu** (9:31 → 9:00). Když je událost přesně na celou hodinu, default je o hodinu dřív (ať je vždy aspoň hodina rezerva). Uživatel může změnit.
- `notifyAt` **vždy padne na celou hodinu** (minuty = 00) — záměrně ladí s hodinovým cronem (běh v celou hodinu → upozornění na celou hodinu = doručení bez zpoždění). Výjimka „v čas události": u kulaté události se trefí přesně, u nekulaté UI upozorní, že při hodinovém cronu dorazí v nejbližší celou hodinu.
- Vždy **jedno upozornění** na událost (žádná víc-upozornění).

**Časové pásmo (DŮLEŽITÉ):** zadávání i zobrazení v **Europe/Prague** (s letním/zimním časem), ukládání a porovnávání interně v **UTC**. Hlídat, ať se posun nerozjede.

**Datový model:** tabulka **`Reminder`** — `message`, `eventAt` (DateTime, čas události), `notifyAt` (DateTime, UTC, kdy poslat mail), `sent` (Bool default false), `sentAt` (DateTime?), `createdAt`.

**Doručení přes Vercel Cron:**

- Cron route (např. `/api/cron/reminders`) volaná **Vercelem jednou za hodinu** (`vercel.json`); free plán to pohodlně zvládne.
- **KRITICKÉ pro spolehlivost:** route vždy vybírá **VŠECHNY** remindery s `notifyAt <= now()` **a** `sent = false` (ne jen ty „přesně v aktuální hodinu"), aby nic nepropadlo mezi běhy. Po odeslání označí `sent = true`, `sentAt = now()`.
- **Bezpečnost:** route chránit tajemstvím `CRON_SECRET` (ověřit autorizační hlavičku), aby ji nešlo spouštět zvenčí.
- **Idempotence:** díky příznaku `sent` se mail nepošle dvakrát, i kdyby cron běžel vícekrát.
- **Architektura nezávislá na frekvenci:** logika nesmí předpokládat „běh po hodině". Kdyby byla později potřeba **přesnost na minutu**, NEŘEŠIT placeným Vercel plánem — levná/free cesta je externí cron služba (např. cron-job.org) volající tu samou chráněnou route každou minutu; web zůstane na free Vercelu.

**Admin UI:** formulář (výše) + tabulka připomínek pod sebou (nadcházející / odeslané), editace, mazání. Calendar view je volitelný bonus, ne nutnost.

> **Poznámka k hostingu (do budoucna):** Zvažuje se případný přechod z Vercelu na **vlastní VPS** (více webů/aplikací pohromadě, plná kontrola nad cronem i limity). Není to teď priorita — řešit až podle reálných limitů Vercelu napříč více aplikacemi, ne kvůli jediné funkci. Reminder modul tomu má být přizpůsoben (route nezávislá na způsobu spouštění cronu).

---

## 12. Jak pracovat na tomto projektu (pravidla pro agenta)

- **Dělej malé kroky.** Jeden úkol = jedna ucelená změna. Neprováděj víc nesouvisejících věcí naráz.
- **Vždy stručně vysvětli, co a proč jsi změnil**, a které soubory.
- **Neměň víc souborů, než je pro úkol nutné.** Nepřepisuj nesouvisející kód.
- **Žádné tajné klíče v kódu** — vždy přes env proměnné.
- **Prisma klient** importuj z `@/lib/prisma` (nevytvářej nové instance PrismaClient).
- **Drž grafitový tmavý styl** a vlastní `<Icon />` komponentu (žádná knihovna ikon).
- **Textarea ve formulářích:** nepoužívej obyčejnou statickou `<textarea>`. V adminu i nových formulářích používej `AutoGrowTextarea`, která se sama zvětšuje podle obsahu (viz perex článku / hromadný import koncertů).
- **V terminálu nic nespouštěj sám**, pokud o to nejsi výslovně požádán — místo toho mi napiš, jaký příkaz mám spustit.
- Když je zadání nejasné nebo něco není v tomto dokumentu rozhodnuté, **zeptej se**, nedomýšlej si.
- Majitel je začátečník v Next.js — preferuj srozumitelná, čitelná řešení před „chytrými" zkratkami.

---

*Tento soubor je zdroj pravdy o podobě webu. Postup instalace/nasazení (terminál, Vercel, účty) sem nepatří — ten řeší majitel mimo projekt.*