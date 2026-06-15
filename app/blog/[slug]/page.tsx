import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleStatus, CoverType } from "@prisma/client";
import {
  ArticleCover,
  ArticleVideoCover,
} from "@/components/blog/ArticleCover";
import { formatPublishedDate } from "@/lib/blog";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const publishedArticleSelect = {
  title: true,
  perex: true,
  content: true,
  coverType: true,
  coverImageUrl: true,
  coverVideoUrl: true,
  publishedAt: true,
} as const;

function renderParagraphs(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p
        key={`${index}-${paragraph.slice(0, 24)}`}
        className="text-base leading-8 text-graphite-text sm:text-[1.05rem] sm:leading-9"
      >
        {paragraph}
      </p>
    ));
}

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
            {article.publishedAt ? (
              <time
                dateTime={article.publishedAt.toISOString()}
                className="block text-sm text-graphite-muted"
              >
                {formatPublishedDate(article.publishedAt)}
              </time>
            ) : null}
          </header>

          <p className="border-l-2 border-graphite-accent bg-graphite-surface px-5 py-4 text-lg leading-8 text-graphite-text sm:text-xl sm:leading-9">
            {article.perex}
          </p>

          {article.content ? (
            <div className="space-y-6 border-t border-graphite-border pt-8">
              {renderParagraphs(article.content)}
            </div>
          ) : null}

          {/* TODO: Galerie — mřížka obrázků z modelu Media (type=IMAGE). */}
          {/* TODO: Audio — přehrávač zvukových ukázek z modelu Media (type=AUDIO). */}
          {/* TODO: Diskuse — komentáře a vlákna z modelu Comment. */}
        </article>
      </main>
    </div>
  );
}
