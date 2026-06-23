import Link from "next/link";
import { redirect } from "next/navigation";
import { importGigsFormAction } from "@/app/admin/koncerty/actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { ButtonLink, EmptyState, TableCard, selectClassName, textareaClassName } from "@/components/admin/AdminUi";
import { AutoGrowTextarea } from "@/components/admin/AutoGrowTextarea";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function AdminGigsPage({
  searchParams,
}: {
  searchParams: Promise<{ time?: string; gear?: string; deleted?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/prihlaseni");
  const params = await searchParams;
  const now = new Date();
  const time = params.time ?? "past";
  const gearFilter = params.gear ?? "all";

  const gigs = await prisma.gig.findMany({
    where: {
      ...(time === "past" ? { date: { lte: now } } : {}),
      ...(gearFilter === "with" ? { gear: { some: {} } } : {}),
      ...(gearFilter === "without" ? { gear: { none: {} } } : {}),
    },
    orderBy: { date: "desc" },
    include: { band: true, gear: { select: { gearId: true } } },
  });
  const bands = await prisma.band.findMany({ orderBy: { name: "asc" } });

  return (
    <AdminShell title="Koncerty" description="Správa koncertů a použitého gearu.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <form className="flex flex-wrap gap-3">
          <select name="time" defaultValue={time} className={selectClassName}>
            <option value="past">Odehrané</option>
            <option value="all">Všechny</option>
          </select>
          <select name="gear" defaultValue={gearFilter} className={selectClassName}>
            <option value="all">Gear: vše</option>
            <option value="with">S gearem</option>
            <option value="without">Bez gearu</option>
          </select>
          <button className="rounded-admin-md bg-admin-primary px-4 text-sm font-medium text-admin-primary-foreground">Filtrovat</button>
        </form>
        <ButtonLink href="/admin/koncerty/novy">Nový koncert</ButtonLink>
      </div>

      {gigs.length === 0 ? (
        <EmptyState title="Žádné koncerty" description="Založ koncert nebo použij hromadný import." />
      ) : (
        <TableCard>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border-subtle bg-admin-surface-muted text-admin-muted">
                <th className="px-5 py-3.5 font-medium">Datum</th>
                <th className="px-5 py-3.5 font-medium">Místo</th>
                <th className="px-5 py-3.5 font-medium">Kapela</th>
                <th className="px-5 py-3.5 font-medium">Gear</th>
                <th className="px-5 py-3.5 font-medium"><span className="sr-only">Akce</span></th>
              </tr>
            </thead>
            <tbody>
              {gigs.map((gig) => (
                <tr key={gig.id} className="border-b border-admin-border-subtle last:border-b-0 hover:bg-admin-surface-muted/60">
                  <td className="px-5 py-3.5 text-admin-muted">{formatDate(gig.date)}</td>
                  <td className="px-5 py-3.5 font-medium text-admin-text">{gig.city}{gig.place ? ` · ${gig.place}` : ""}</td>
                  <td className="px-5 py-3.5 text-admin-muted">{gig.band.name}</td>
                  <td className="px-5 py-3.5 text-admin-muted">{gig.gear.length}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/koncerty/${gig.id}`} className="font-medium text-admin-accent hover:text-admin-accent-hover">Upravit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}

      <section className="mt-8 rounded-admin-lg border border-admin-border bg-admin-surface p-admin-6">
        <h2 className="text-admin-card-title font-semibold text-admin-text">Hromadný import</h2>
        <p className="mt-1 text-sm text-admin-muted">Každý řádek: 13. 3. 2026 | Uherské Hradiště | klub Mír</p>
        <form action={importGigsFormAction} className="mt-5 space-y-4">
          <select name="bandId" className={selectClassName} required>
            <option value="">Vyber kapelu</option>
            {bands.map((band) => <option key={band.id} value={band.id}>{band.name}</option>)}
          </select>
          <AutoGrowTextarea
            name="lines"
            rows={6}
            className={`${textareaClassName} block min-h-36 resize-none overflow-hidden py-2.5 leading-relaxed`}
          />
          <button className="rounded-admin-md bg-admin-primary px-5 py-2 text-sm font-medium text-admin-primary-foreground">Importovat</button>
        </form>
      </section>
    </AdminShell>
  );
}
