import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleStatus, CoverType } from "@prisma/client";
import {
  ArticleCover,
  ArticleVideoCover,
} from "@/components/blog/ArticleCover";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { ArticleReviewScores } from "@/components/blog/ArticleReviewScores";
import { formatPublishedDate, shouldShowArticleUpdated } from "@/lib/blog";
import { prisma } from "@/lib/prisma";
import { reviewScoresFromArticle } from "@/lib/review-score";

export const dynamic = "force-dynamic";

const publishedArticleSelect = {
  title: true,
  perex: true,
  content: true,
  coverType: true,
  coverImageUrl: true,
  coverVideoUrl: true,
  publishedAt: true,
  updatedAt: true,
  scoreLegacy: true,
  scorePracticality: true,
  scorePrice: true,
  scoreSound: true,
  scoreLook: true,
  articleTags: {
    select: { tag: { select: { name: true, slug: true } } },
  },
} as const;

function toVideoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (
      parsed.hostname === "youtu.be" ||
      parsed.hostname.endsWith("youtube.com")
    ) {
      const videoId =
        parsed.hostname === "youtu.be"
          ? parsed.pathname.slice(1)
          : parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (
      parsed.hostname.endsWith("vimeo.com") &&
      /^\/\d+/.test(parsed.pathname)
    ) {
      return `https://player.vimeo.com/video${parsed.pathname}`;
    }
  } catch {
    return null;
  }

  return null;
}

function ArticleCoverSection({
  coverType,
  coverImageUrl,
  coverVideoUrl,
  title,
}: {
  coverType: CoverType;
  coverImageUrl: string | null;
  coverVideoUrl: string | null;
  title: string;
}) {
  if (coverType === CoverType.VIDEO && coverVideoUrl) {
    const embedUrl = toVideoEmbedUrl(coverVideoUrl);

    if (embedUrl) {
      return (
        <div className="relative aspect-video overflow-hidden rounded-xl border border-graphite-border bg-black">
          <iframe
            src={embedUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }

    return <ArticleVideoCover src={coverVideoUrl} title={title} />;
  }

  if (coverImageUrl) {
    return <ArticleCover src={coverImageUrl} alt={title} priority />;
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: publishedArticleSelect,
  });

  if (!article) {
    return { title: "Článek nenalezen" };
  }

  return {
    title: `${article.title} | stepansoukup.cz`,
    description: article.perex,
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: publishedArticleSelect,
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-full bg-graphite-bg text-graphite-text">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href="/"
          className="text-sm text-graphite-muted transition hover:text-graphite-accent"
        >
          ← Zpět na blog
        </Link>

        <article className="mt-8 space-y-8">
          <ArticleCoverSection
            coverType={article.coverType}
            coverImageUrl={article.coverImageUrl}
            coverVideoUrl={article.coverVideoUrl}
            title={article.title}
          />

          <header className="space-y-4">
            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {article.title}
            </h1>
            <div className="space-y-1 text-sm text-graphite-muted">
              {article.publishedAt ? (
                <time dateTime={article.publishedAt.toISOString()}>
                  {formatPublishedDate(article.publishedAt)}
                </time>
              ) : null}
              {shouldShowArticleUpdated(article.publishedAt, article.updatedAt) ? (
                <p>
                  Aktualizováno:{" "}
                  <time dateTime={article.updatedAt.toISOString()}>
                    {formatPublishedDate(article.updatedAt)}
                  </time>
                </p>
              ) : null}
            </div>
          </header>

          <p className="border-l-2 border-graphite-accent bg-graphite-surface px-5 py-4 text-lg leading-8 text-graphite-text sm:text-xl sm:leading-9">
            {article.perex}
          </p>

          <ArticleReviewScores scores={reviewScoresFromArticle(article)} />

          {article.content ? <ArticleBody content={article.content} /> : null}

          {article.articleTags.length > 0 ? (
            <div className="flex flex-wrap gap-2 border-t border-graphite-border pt-6">
              {article.articleTags.map((link) => (
                <Link
                  key={link.tag.slug}
                  href={`/?tag=${encodeURIComponent(link.tag.slug)}`}
                  className="rounded-full border border-graphite-border px-3 py-1 text-sm text-graphite-muted transition hover:border-graphite-accent hover:text-graphite-accent"
                >
                  {link.tag.name}
                </Link>
              ))}
            </div>
          ) : null}

          {/* TODO: Diskuse — komentáře a vlákna z modelu Comment. */}
        </article>
      </main>
    </div>
  );
}
