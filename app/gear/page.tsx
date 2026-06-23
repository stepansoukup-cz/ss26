import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";
import { ensureDefaultGearCategories } from "@/lib/gear-categories";
import { getGearStatsMap } from "@/lib/gear-stats";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function GearCard({ item, stats }: { item: any; stats: { gigCount: number; ownershipDays: number | null } }) {
  return (
    <Link href={`/gear/${item.id}`} className="group overflow-hidden rounded-[1.5rem] border border-graphite-border bg-graphite-surface transition hover:border-graphite-accent">
      <div className="aspect-video bg-graphite-bg">
        {item.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.coverImageUrl} alt={`${item.brand} ${item.model}`} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-graphite-muted">Gear</div>
        )}
      </div>
      <div className="p-5">
        <p className="text-sm text-graphite-accent">{item.category.name}</p>
        <h2 className="mt-2 text-xl font-medium text-white group-hover:text-graphite-accent">{item.brand} {item.model}</h2>
        <p className="mt-3 text-sm text-graphite-muted">{stats.gigCount} koncertů · {stats.ownershipDays ?? "?"} dní vlastnictví</p>
        {item.listingUrl && !item.soldAt ? (
          <p className="mt-3 text-sm font-medium text-graphite-accent">
            Aktuálně na prodej
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function Section({ title, items, stats }: { title: string; items: any[]; stats: Map<string, any> }) {
  if (!items.length) return null;
  return (
    <section className="py-12">
      <h2 className="mb-6 text-3xl font-medium">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <GearCard key={item.id} item={item} stats={stats.get(item.id) ?? { gigCount: 0, ownershipDays: null }} />
        ))}
      </div>
    </section>
  );
}

export default async function GearPage({
  searchParams,
}: {
  searchParams: Promise<{ kategorie?: string; sort?: string }>;
}) {
  await ensureDefaultGearCategories();
  const params = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const gear = await prisma.gear.findMany({
    where: {
      containerId: null,
      ...(params.kategorie ? { category: { slug: params.kategorie } } : {}),
    },
    include: { category: true },
  });
  const stats = await getGearStatsMap(gear);
  const sorted = [...gear].sort((a, b) => {
    const statA = stats.get(a.id) ?? { gigCount: 0, ownershipDays: 0 };
    const statB = stats.get(b.id) ?? { gigCount: 0, ownershipDays: 0 };
    return params.sort === "dny"
      ? (statB.ownershipDays ?? 0) - (statA.ownershipDays ?? 0)
      : statB.gigCount - statA.gigCount;
  });
  const live = sorted.filter((item) => !item.soldAt && !item.inDrawer);
  const drawer = sorted.filter((item) => !item.soldAt && item.inDrawer);
  const sold = sorted.filter((item) => item.soldAt);

  return (
    <div className="min-h-full bg-graphite-bg text-graphite-text">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-graphite-accent">Gear</p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl">Vybavení</h1>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/gear" className="rounded-full border border-graphite-border px-3 py-1 text-sm text-graphite-muted hover:text-white">Vše</Link>
          {categories.map((category) => (
            <Link key={category.id} href={`/gear?kategorie=${category.slug}`} className="rounded-full border border-graphite-border px-3 py-1 text-sm text-graphite-muted hover:text-white">{category.name}</Link>
          ))}
          <Link href="/gear?sort=koncerty" className="rounded-full border border-graphite-border px-3 py-1 text-sm text-graphite-muted hover:text-white">Řadit: koncerty</Link>
          <Link href="/gear?sort=dny" className="rounded-full border border-graphite-border px-3 py-1 text-sm text-graphite-muted hover:text-white">Řadit: dny</Link>
        </div>
        <Section title="Live" items={live} stats={stats} />
        <Section title="Doma / šuplík" items={drawer} stats={stats} />
        <Section title="Prodané" items={sold} stats={stats} />
      </main>
    </div>
  );
}
