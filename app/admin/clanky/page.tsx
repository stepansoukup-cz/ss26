import Link from "next/link";
import { redirect } from "next/navigation";
import { ArticleStatus } from "@prisma/client";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Alert,
  Badge,
  ButtonLink,
  EmptyState,
  TableCard,
} from "@/components/admin/AdminUi";
import { formatPublishedDate } from "@/lib/blog";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatUpdatedAt(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function StatusBadge({ status }: { status: ArticleStatus }) {
  if (status === ArticleStatus.PUBLISHED) {
    return <Badge variant="published">Publikováno</Badge>;
  }

  return <Badge variant="draft">Koncept</Badge>;
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/prihlaseni");
  }

  const { deleted } = await searchParams;

  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return (
    <AdminShell
      title="Články"
      description="Správa blogových příspěvků — koncepty i publikované články."
    >
      {deleted === "1" ? (
        <Alert variant="success" className="mb-6">
          Článek byl trvale smazán včetně souvisejících souborů.
        </Alert>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-admin-muted">
          {articles.length === 0
            ? "Zatím žádné články."
            : `Celkem ${articles.length} ${articles.length === 1 ? "článek" : articles.length < 5 ? "články" : "článků"}.`}
        </p>
        <ButtonLink href="/admin/clanky/novy">Nový článek</ButtonLink>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title="Zatím tu nejsou žádné články"
          description="Vytvoř první článek a začni publikovat na blogu."
          action={<ButtonLink href="/admin/clanky/novy">Nový článek</ButtonLink>}
        />
      ) : (
        <TableCard>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border-subtle bg-admin-surface-muted text-admin-muted">
                <th className="px-5 py-3.5 font-medium">Titulek</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Publikováno</th>
                <th className="px-5 py-3.5 font-medium">Upraveno</th>
                <th className="px-5 py-3.5 font-medium">
                  <span className="sr-only">Akce</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-admin-border-subtle last:border-b-0 transition hover:bg-admin-surface-muted/60"
                >
                  <td className="px-5 py-3.5 font-medium text-admin-text">
                    {article.title}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="px-5 py-3.5 text-admin-muted">
                    {article.publishedAt
                      ? formatPublishedDate(article.publishedAt)
                      : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-admin-muted">
                    {formatUpdatedAt(article.updatedAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/clanky/${article.id}`}
                      className="font-medium text-admin-accent transition hover:text-admin-accent-hover"
                    >
                      Upravit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}
    </AdminShell>
  );
}
