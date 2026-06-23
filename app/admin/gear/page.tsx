import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  Badge,
  ButtonLink,
  EmptyState,
  TableCard,
  selectClassName,
} from "@/components/admin/AdminUi";
import { getCurrentUser } from "@/lib/auth/user";
import { ensureDefaultGearCategories } from "@/lib/gear-categories";
import { getGearStatsMap } from "@/lib/gear-stats";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function gearState(gear: { soldAt: Date | null; inDrawer: boolean }) {
  if (gear.soldAt) return <Badge variant="draft">Prodáno</Badge>;
  if (gear.inDrawer) return <Badge variant="neutral">Doma / šuplík</Badge>;
  return <Badge variant="published">Live</Badge>;
}

function gearWhereForStatus(status: string): Prisma.GearWhereInput {
  switch (status) {
    case "all":
      return {};
    case "live":
      return { soldAt: null, inDrawer: false };
    case "home":
      return { soldAt: null, inDrawer: true };
    case "sold":
      return { soldAt: { not: null } };
    case "active":
    default:
      return { soldAt: null };
  }
}

export default async function AdminGearPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/prihlaseni");
  await ensureDefaultGearCategories();
  const { deleted, status: rawStatus } = await searchParams;
  const status = rawStatus ?? "active";

  const gear = await prisma.gear.findMany({
    where: gearWhereForStatus(status),
    orderBy: [
      { boughtAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
      { brand: "asc" },
      { model: "asc" },
    ],
    select: {
      id: true,
      brand: true,
      model: true,
      boughtAt: true,
      soldAt: true,
      inDrawer: true,
      createdAt: true,
      category: { select: { name: true } },
      container: { select: { brand: true, model: true } },
    },
  });
  const stats = await getGearStatsMap(gear);

  return (
    <AdminShell title="Gear" description="Správa vybavení, kontejnerů a soukromých údajů.">
      {deleted === "1" ? (
        <div className="mb-6 rounded-admin-lg border border-admin-success-border bg-admin-success-muted px-admin-4 py-admin-3 text-admin-success">
          Gear byl smazán.
        </div>
      ) : null}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <form className="flex flex-wrap gap-3">
          <select name="status" defaultValue={status} className={selectClassName}>
            <option value="active">Neprodané</option>
            <option value="live">Live</option>
            <option value="home">Doma / šuplík</option>
            <option value="sold">Prodáno</option>
            <option value="all">Vše</option>
          </select>
          <button className="rounded-admin-md bg-admin-primary px-4 text-sm font-medium text-admin-primary-foreground">
            Filtrovat
          </button>
        </form>
        <p className="text-sm text-admin-muted">Zobrazeno {gear.length} položek.</p>
        <ButtonLink href="/admin/gear/novy">Nový gear</ButtonLink>
      </div>
      {gear.length === 0 ? (
        <EmptyState title="Žádný gear pro vybraný filtr" description="Zkus jiný filtr nebo založ nový kus vybavení." action={<ButtonLink href="/admin/gear/novy">Nový gear</ButtonLink>} />
      ) : (
        <TableCard>
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border-subtle bg-admin-surface-muted text-admin-muted">
                <th className="px-5 py-3.5 font-medium">Gear</th>
                <th className="px-5 py-3.5 font-medium">Kategorie</th>
                <th className="px-5 py-3.5 font-medium">Koupeno</th>
                <th className="px-5 py-3.5 font-medium">Stav</th>
                <th className="px-5 py-3.5 font-medium">Koncerty</th>
                <th className="px-5 py-3.5 font-medium">Kontejner</th>
                <th className="px-5 py-3.5 font-medium"><span className="sr-only">Akce</span></th>
              </tr>
            </thead>
            <tbody>
              {gear.map((item) => (
                <tr key={item.id} className="border-b border-admin-border-subtle last:border-b-0 hover:bg-admin-surface-muted/60">
                  <td className="px-5 py-3.5 font-medium text-admin-text">{item.brand} {item.model}</td>
                  <td className="px-5 py-3.5 text-admin-muted">{item.category?.name ?? "Bez kategorie"}</td>
                  <td className="px-5 py-3.5 text-admin-muted">{item.boughtAt ? item.boughtAt.toLocaleDateString("cs-CZ") : "—"}</td>
                  <td className="px-5 py-3.5">{gearState(item)}</td>
                  <td className="px-5 py-3.5 text-admin-muted">{stats.get(item.id)?.gigCount ?? 0}</td>
                  <td className="px-5 py-3.5 text-admin-muted">{item.container ? `${item.container.brand} ${item.container.model}` : "—"}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/gear/${item.id}`} className="font-medium text-admin-accent hover:text-admin-accent-hover">Upravit</Link>
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
