import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { ArticleCover } from "@/components/blog/ArticleCover";
import { BlogTagFilter } from "@/components/blog/BlogTagFilter";
import { formatPublishedDate } from "@/lib/blog";
import { prisma } from "@/lib/prisma";
import { getPublishedTags } from "@/lib/tags";

export const dynamic = "force-dynamic";

function parseSelectedTags(raw: string | string[] | undefined): string[] {
  if (!raw) {
    return [];
  }
  const list = Array.isArray(raw) ? raw : [raw];
  return Array.from(new Set(list.map((value) => value.trim()).filter(Boolean)));
}

function TagPills({ tags }: { tags: { name: string; slug: string }[] }) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.slug}
          className="rounded-full border border-graphite-border px-2.5 py-0.5 text-xs text-graphite-muted"
        >
          {tag.name}
        </span>
      ))}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>;
}) {
  const { tag } = await searchParams;
  const selectedTags = parseSelectedTags(tag);

  const [allTags, articles] = await Promise.all([
    getPublishedTags(),
    prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        ...(selectedTags.length
          ? {
              articleTags: {
                some: { tag: { slug: { in: selectedTags } } },
              },
            }
          : {}),
      },
      orderBy: { publishedAt: "desc" },
      select: {
        slug: true,
        title: true,
        perex: true,
        coverImageUrl: true,
        publishedAt: true,
        articleTags: {
          select: { tag: { select: { name: true, slug: true } } },
        },
      },
    }),
  ]);

  // Jen platné vybrané štítky (které opravdu existují u publikovaných článků).
  const validSelected = selectedTags.filter((slug) =>
    allTags.some((t) => t.slug === slug),
  );

  const withTags = articles.map((article) => ({
    ...article,
    tags: article.articleTags.map((link) => link.tag),
  }));

  const [featured, ...rest] = withTags;

  return (
    <div className="min-h-full bg-graphite-bg text-graphite-text">
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <header className="mb-8 border-b border-graphite-border pb-8">
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

        {allTags.length > 0 ? (
          <div className="mb-10">
            <BlogTagFilter tags={allTags} selected={validSelected} />
          </div>
        ) : null}

        {withTags.length === 0 ? (
          <p className="rounded-xl border border-graphite-border bg-graphite-surface px-6 py-10 text-center text-graphite-muted">
            {validSelected.length
              ? "Pro vybrané štítky tu zatím nejsou žádné články."
              : "Zatím tu nejsou žádné publikované články."}
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
                    <TagPills tags={featured.tags} />
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
                        <TagPills tags={article.tags} />
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
