import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Badge,
  EmptyState,
  TableCard,
  inputClassName,
} from "@/components/admin/AdminUi";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

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

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  const zonedAsUtc = Date.UTC(
    values.year,
    values.month - 1,
    values.day,
    values.hour,
    values.minute,
    values.second,
  );

  return zonedAsUtc - date.getTime();
}

function pragueDateToUtc(year: number, month: number, day: number) {
  const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  return new Date(guess.getTime() - getTimeZoneOffsetMs(guess, "Europe/Prague"));
}

function parseDateRange(query: string) {
  const trimmed = query.trim();
  const czech = trimmed.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?$/);
  const iso = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  let year: number;
  let month: number;
  let day: number;

  if (czech) {
    day = Number(czech[1]);
    month = Number(czech[2]);
    year = czech[3] ? Number(czech[3]) : new Date().getFullYear();
  } else if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else {
    return null;
  }

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const gte = pragueDateToUtc(year, month, day);
  const lt = pragueDateToUtc(year, month, day + 1);
  return { gte, lt };
}

function buildSearchWhere(query: string): Prisma.ContactMessageWhereInput {
  const trimmed = query.trim();
  if (!trimmed) {
    return {};
  }

  const terms = trimmed.split(/\s+/).filter(Boolean);

  return {
    AND: terms.map((term) => {
      const dateRange = parseDateRange(term);
      const textSearch = {
        contains: term,
        mode: "insensitive" as const,
      };

      return {
        OR: [
          { name: textSearch },
          { email: textSearch },
          { subject: textSearch },
          { body: textSearch },
          { emailError: textSearch },
          ...(dateRange ? [{ createdAt: dateRange }] : []),
        ],
      };
    }),
  };
}

function pageHref(page: number, q: string) {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const suffix = params.toString();
  return `/admin/zpravy${suffix ? `?${suffix}` : ""}`;
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

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/prihlaseni");
  }

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const currentPage = Math.max(1, Number(params.page) || 1);
  const where = buildSearchWhere(q);

  const [total, messages] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        body: true,
        read: true,
        emailSentAt: true,
        emailError: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminShell
      title="Zprávy z formuláře"
      description="Historie kontaktních zpráv uložených před odesláním e-mailu."
    >
      <form action="/admin/zpravy" className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Hledat jméno, e-mail, předmět, text nebo datum (22.6.2026)…"
          className={inputClassName}
        />
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center rounded-admin-md bg-admin-primary px-5 text-sm font-medium text-admin-primary-foreground transition hover:bg-admin-primary-hover"
        >
          Hledat
        </button>
        {q ? (
          <Link
            href="/admin/zpravy"
            className="inline-flex h-10 items-center justify-center rounded-admin-md border border-admin-border px-5 text-sm font-medium text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text"
          >
            Zrušit filtr
          </Link>
        ) : null}
      </form>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-admin-muted">
        <p>
          {total === 0
            ? "Žádné zprávy."
            : `Zobrazeno ${messages.length} z ${total} zpráv.`}
        </p>
        {totalPages > 1 ? (
          <p>
            Strana {currentPage} / {totalPages}
          </p>
        ) : null}
      </div>

      {messages.length === 0 ? (
        <EmptyState
          title="Nic nenalezeno"
          description={
            q
              ? "Zkus upravit vyhledávání nebo filtr zrušit."
              : "Z kontaktního formuláře zatím nepřišla žádná zpráva."
          }
        />
      ) : (
        <TableCard>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border-subtle bg-admin-surface-muted text-admin-muted">
                <th className="px-5 py-3.5 font-medium">Datum</th>
                <th className="px-5 py-3.5 font-medium">Odesílatel</th>
                <th className="px-5 py-3.5 font-medium">Předmět</th>
                <th className="px-5 py-3.5 font-medium">Stav</th>
                <th className="px-5 py-3.5 font-medium">
                  <span className="sr-only">Akce</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr
                  key={message.id}
                  className={`border-b border-admin-border-subtle last:border-b-0 transition hover:bg-admin-surface-muted/60 ${
                    message.read ? "" : "bg-admin-accent-muted/25"
                  }`}
                >
                  <td className="whitespace-nowrap px-5 py-3.5 text-admin-muted">
                    {formatDateTime(message.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-admin-text">{message.name}</p>
                    <p className="text-admin-muted">{message.email}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-admin-text">
                      {message.subject ?? "Bez předmětu"}
                    </p>
                    <p className="mt-1 line-clamp-2 max-w-xl text-admin-muted">
                      {message.body}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <EmailStatus
                      emailSentAt={message.emailSentAt}
                      emailError={message.emailError}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/zpravy/${message.id}`}
                      className="font-medium text-admin-accent transition hover:text-admin-accent-hover"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          {currentPage > 1 ? (
            <Link
              href={pageHref(currentPage - 1, q)}
              className="rounded-admin-md border border-admin-border px-4 py-2 text-sm text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text"
            >
              Předchozí
            </Link>
          ) : null}
          {currentPage < totalPages ? (
            <Link
              href={pageHref(currentPage + 1, q)}
              className="rounded-admin-md border border-admin-border px-4 py-2 text-sm text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text"
            >
              Další
            </Link>
          ) : null}
        </div>
      ) : null}
    </AdminShell>
  );
}
