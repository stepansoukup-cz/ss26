import {
  ArticleStatus,
  CoverType,
  PrismaClient,
  Role,
} from "@prisma/client";
import {
  plainTextToArticleDoc,
  serializeArticleDoc,
} from "../lib/article-doc";

const prisma = new PrismaClient();

const articles = [
  {
    slug: "novy-web-stepansoukup-cz",
    title: "Spouštím nový web stepansoukup.cz",
    perex:
      "První článek na přestavěném webu — blog, hudba, programování a studio na jednom místě. Tady je, co mě na projektu baví.",
    content: serializeArticleDoc(
      plainTextToArticleDoc(`Po letech s Nette jsem se pustil do Next.js a tento web je můj učební i pracovní projekt zároveň.

Na blogu budu sdílet postřehy ze studia, z vývoje i ze sólové i kapelní dráhy. Cílem je mít jedno místo, které dává smysl návštěvníkům i mně jako autorovi.

Těším se, až tu přibudou reálné články, fotky ze zkoušek a třeba i ukázky z mixu.`),
    ),
    coverImageUrl: "https://picsum.photos/seed/ss26-web/1600/900",
    publishedAt: new Date("2026-03-10T10:00:00.000Z"),
  },
  {
    slug: "mix-mastering-v-domacim-studiu",
    title: "Mix a mastering v domácím studiu: co se osvědčilo",
    perex:
      "Krátký pohled na workflow, které používám při práci na demách kapel i vlastních nahrávkách.",
    content: serializeArticleDoc(
      plainTextToArticleDoc(`Každý projekt začíná poslechem referencí a domluvou, jaký zvuk má výsledek mít. Teprve potom řeším úpravy a dynamiku.

V domácím studiu je klíčové znát limity místnosti a nebát se vrátit k surovým stopám, když mix nepůsobí přirozeně.

V dalších článcích rozeberu konkrétní postupy — třeba práci s vokálem nebo přípravu materiálu před masteringem.`),
    ),
    coverImageUrl: "https://picsum.photos/seed/ss26-studio/1600/900",
    publishedAt: new Date("2026-03-12T14:30:00.000Z"),
  },
  {
    slug: "next-js-prvni-projekt",
    title: "Next.js jako první projekt: co jsem se naučil",
    perex:
      "Zkušenosti z přechodu z Nette na App Router, Prisma a nasazení na Vercel — bez zbytečného žargonu.",
    content: serializeArticleDoc(
      plainTextToArticleDoc(`Největší změna oproti Nette je myšlení v komponentách a serverových akcích. Co dřív patřilo do presenteru, dnes rozděluji mezi stránky, layouty a server actions.

Prisma a Neon mi vyhovují pro rychlý start. Cloudinary řeší média a admin si postupně buduju po malých krocích.

Tenhle článek je zatím testovací, ale struktura už odpovídá tomu, jak bude blog doopravdy vypadat.`),
    ),
    coverImageUrl: "https://picsum.photos/seed/ss26-nextjs/1600/900",
    publishedAt: new Date("2026-03-14T09:15:00.000Z"),
  },
] as const;

async function main() {
  const email = process.env.ADMIN_EMAIL;

  const author = await prisma.user.findFirst({
    where: email ? { email } : { role: Role.ADMIN },
    orderBy: { createdAt: "asc" },
  });

  if (!author) {
    throw new Error(
      "Nenalezen admin uživatel. Nejdřív spusť npm run db:seed.",
    );
  }

  for (const article of articles) {
    const saved = await prisma.article.upsert({
      where: { slug: article.slug },
      create: {
        slug: article.slug,
        title: article.title,
        perex: article.perex,
        content: article.content,
        coverType: CoverType.IMAGE,
        coverImageUrl: article.coverImageUrl,
        status: ArticleStatus.PUBLISHED,
        publishedAt: article.publishedAt,
        authorId: author.id,
      },
      update: {
        title: article.title,
        perex: article.perex,
        content: article.content,
        coverType: CoverType.IMAGE,
        coverImageUrl: article.coverImageUrl,
        status: ArticleStatus.PUBLISHED,
        publishedAt: article.publishedAt,
        authorId: author.id,
      },
    });

    console.log(`Článek připraven: ${saved.slug}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
