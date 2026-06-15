import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { ArticleCover } from "@/components/blog/ArticleCover";
import { formatPublishedDate } from "@/lib/blog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      perex: true,
      coverImageUrl: true,
      publishedAt: true,
    },
  });

  const [featured, ...rest] = articles;

  return (
    <div className="min-h-full bg-graphite-bg text-graphite-text">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <header className="mb-10 border-b border-graphite-border pb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-graphite-muted">
            Blog
          </p>
          <h1 className="mt-2 text-3xl font-medium sm:text-4xl">
            stepansoukup.cz
          </h1>
          <p className="mt-3 max-w-2xl text-graphite-muted">
            Hudba, programování, studio a články z první ruky.
          </p>
        </header>

        {articles.length === 0 ? (
          <p className="rounded-xl border border-graphite-border bg-graphite-surface px-6 py-10 text-center text-graphite-muted">
            Zatím tu nejsou žádné publikované články.
          </p>
        ) : (
          <div className="space-y-12">
            {featured ? (
              <section>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group block space-y-5"
                >
                  {featured.coverImageUrl ? (
                    <ArticleCover
                      src={featured.coverImageUrl}
                      alt={featured.title}
                      priority
                      interactive
                    />
                  ) : null}
                  <div className="space-y-3">
                    {featured.publishedAt ? (
                      <time
                        dateTime={featured.publishedAt.toISOString()}
                        className="text-sm text-graphite-muted"
                      >
                        {formatPublishedDate(featured.publishedAt)}
                      </time>
                    ) : null}
                    <h2 className="text-2xl font-medium transition group-hover:text-graphite-accent sm:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="max-w-3xl text-base leading-7 text-graphite-muted sm:text-lg">
                      {featured.perex}
                    </p>
                  </div>
                </Link>
              </section>
            ) : null}

            {rest.length > 0 ? (
              <section>
                <h2 className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-graphite-muted">
                  Další články
                </h2>
                <div className="grid gap-8 sm:grid-cols-2">
                  {rest.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/blog/${article.slug}`}
                      className="group space-y-4"
                    >
                      {article.coverImageUrl ? (
                        <ArticleCover
                          src={article.coverImageUrl}
                          alt={article.title}
                          interactive
                        />
                      ) : null}
                      <div className="space-y-2">
                        {article.publishedAt ? (
                          <time
                            dateTime={article.publishedAt.toISOString()}
                            className="text-sm text-graphite-muted"
                          >
                            {formatPublishedDate(article.publishedAt)}
                          </time>
                        ) : null}
                        <h3 className="text-xl font-medium transition group-hover:text-graphite-accent">
                          {article.title}
                        </h3>
                        <p className="line-clamp-3 text-sm leading-6 text-graphite-muted">
                          {article.perex}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
