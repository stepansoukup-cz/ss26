import { redirect, notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/prihlaseni");
  }

  const { id } = await params;
  const query = await searchParams;

  const article = await prisma.article.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      perex: true,
      content: true,
      coverType: true,
      coverImageUrl: true,
      coverVideoUrl: true,
      status: true,
      scoreLegacy: true,
      scorePracticality: true,
      scorePrice: true,
      scoreSound: true,
      scoreLook: true,
      articleTags: {
        select: { tag: { select: { name: true } } },
      },
    },
  });

  if (!article) {
    notFound();
  }

  return (
    <AdminShell
      title="Upravit článek"
      description={article.title}
    >
      <ArticleForm
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          perex: article.perex,
          content: article.content ?? "",
          coverType: article.coverType,
          coverImageUrl: article.coverImageUrl ?? "",
          coverVideoUrl: article.coverVideoUrl ?? "",
          status: article.status,
          reviewScores: {
            scoreLegacy: article.scoreLegacy,
            scorePracticality: article.scorePracticality,
            scorePrice: article.scorePrice,
            scoreSound: article.scoreSound,
            scoreLook: article.scoreLook,
          },
          tags: article.articleTags.map((link) => link.tag.name),
        }}
        saved={query.saved === "1"}
      />
    </AdminShell>
  );
}
