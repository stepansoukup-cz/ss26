import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCard, Badge } from "@/components/admin/AdminUi";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function EmailStatus({
  emailSentAt,
  emailError,
}: {
  emailSentAt: Date | null;
  emailError: string | null;
}) {
  if (emailSentAt) {
    return <Badge variant="published">E-mail odeslán</Badge>;
  }
  if (emailError) {
    return <Badge variant="draft">E-mail selhal</Badge>;
  }
  return <Badge variant="neutral">Čeká</Badge>;
}

export default async function AdminMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/prihlaseni");
  }

  const { id } = await params;
  const message = await prisma.contactMessage.findUnique({
    where: { id },
  });

  if (!message) {
    notFound();
  }

  if (!message.read) {
    await prisma.contactMessage.update({
      where: { id: message.id },
      data: { read: true },
    });
  }

  return (
    <AdminShell
      title="Detail zprávy"
      description="Celý obsah zprávy z kontaktního formuláře."
    >
      <div className="mb-6">
        <Link
          href="/admin/zpravy"
          className="text-sm font-medium text-admin-muted transition hover:text-admin-accent"
        >
          ← Zpět na zprávy
        </Link>
      </div>

      <AdminCard>
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-admin-muted">
                Přijato {formatDateTime(message.createdAt)}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-admin-text">
                {message.subject ?? "Bez předmětu"}
              </h2>
            </div>
            <EmailStatus
              emailSentAt={message.emailSentAt}
              emailError={message.emailError}
            />
          </div>

          <dl className="grid gap-4 border-y border-admin-border-subtle py-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-admin-faint">
                Jméno
              </dt>
              <dd className="mt-1 text-admin-text">{message.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-admin-faint">
                E-mail
              </dt>
              <dd className="mt-1">
                <a
                  href={`mailto:${message.email}`}
                  className="text-admin-accent transition hover:text-admin-accent-hover"
                >
                  {message.email}
                </a>
              </dd>
            </div>
            {message.emailSentAt ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-admin-faint">
                  E-mail odeslán
                </dt>
                <dd className="mt-1 text-admin-text">
                  {formatDateTime(message.emailSentAt)}
                </dd>
              </div>
            ) : null}
          </dl>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-admin-faint">
              Zpráva
            </h3>
            <div className="mt-3 whitespace-pre-wrap rounded-admin-lg border border-admin-border bg-admin-bg p-5 leading-7 text-admin-text">
              {message.body}
            </div>
          </div>

          {message.emailError ? (
            <div className="rounded-admin-lg border border-admin-warning-border bg-admin-warning-muted p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-admin-warning">
                Chyba odeslání e-mailu
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-admin-text">
                {message.emailError}
              </p>
            </div>
          ) : null}
        </div>
      </AdminCard>
    </AdminShell>
  );
}
