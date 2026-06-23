import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleStatus } from "@prisma/client";
import { PublicHeader } from "@/components/site/PublicHeader";
import { getGearStats } from "@/lib/gear-stats";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GearDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gear = await prisma.gear.findUnique({
    where: { id },
    include: {
      category: true,
      containedGear: {
        include: { category: true },
        orderBy: [{ brand: "asc" }, { model: "asc" }],
      },
      articleLinks: {
        where: { article: { status: ArticleStatus.PUBLISHED } },
        include: { article: { select: { title: true, slug: true, perex: true } } },
      },
      gigs: {
        include: { gig: { include: { band: true } } },
        orderBy: { gig: { date: "desc" } },
        take: 10,
      },
    },
  });
  if (!gear) notFound();
  const stats = await getGearStats(gear);

  return (
    <div className="min-h-full bg-graphite-bg text-graphite-text">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Link href="/gear" className="text-sm text-graphite-muted hover:text-white">← Zpět na gear</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-graphite-accent">{gear.category.name}</p>
            <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl">{gear.brand} {gear.model}</h1>
            {gear.note ? <p className="mt-6 text-lg leading-8 text-graphite-muted">{gear.note}</p> : null}
            <div className="mt-8 flex flex-wrap gap-2 text-sm text-graphite-muted">
              <span className="rounded-full border border-graphite-border px-3 py-1">{stats.gigCount} koncertů</span>
              <span className="rounded-full border border-graphite-border px-3 py-1">{stats.ownershipDays ?? "?"} dní vlastnictví</span>
              {gear.inDrawer ? <span className="rounded-full border border-graphite-border px-3 py-1">Šuplík</span> : null}
              {gear.soldAt ? <span className="rounded-full border border-graphite-border px-3 py-1">Prodáno</span> : null}
            </div>
            {gear.listingUrl && !gear.soldAt ? (
              <a
                href={gear.listingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex rounded-full bg-graphite-accent px-5 py-3 text-sm font-medium text-white transition hover:bg-graphite-accent-hover"
              >
                Koupit ode mě přes inzerát
              </a>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-[1.5rem] border border-graphite-border bg-graphite-surface">
            {gear.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gear.coverImageUrl} alt={`${gear.brand} ${gear.model}`} className="aspect-video w-full object-cover" />
            ) : (
              <div className="grid aspect-video place-items-center text-graphite-muted">Gear</div>
            )}
          </div>
        </div>

        {gear.containedGear.length ? (
          <section className="mt-16">
            <h2 className="text-3xl font-medium">Obsah kontejneru</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gear.containedGear.map((child) => (
                <Link key={child.id} href={`/gear/${child.id}`} className="rounded-[1rem] border border-graphite-border bg-graphite-surface p-4 hover:border-graphite-accent">
                  <p className="text-sm text-graphite-accent">{child.category.name}</p>
                  <h3 className="mt-1 font-medium text-white">{child.brand} {child.model}</h3>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {gear.articleLinks.length ? (
          <section className="mt-16">
            <h2 className="text-3xl font-medium">Recenze / články</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {gear.articleLinks.map((link) => (
                <Link key={link.article.slug} href={`/blog/${link.article.slug}`} className="rounded-[1rem] border border-graphite-border bg-graphite-surface p-5 hover:border-graphite-accent">
                  <h3 className="font-medium text-white">{link.article.title}</h3>
                  <p className="mt-2 text-sm text-graphite-muted">{link.article.perex}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {gear.gigs.length ? (
          <section className="mt-16">
            <h2 className="text-3xl font-medium">Poslední koncerty s tímto kusem</h2>
            <div className="mt-6 divide-y divide-graphite-border rounded-[1rem] border border-graphite-border bg-graphite-surface">
              {gear.gigs.map(({ gig }) => (
                <div key={gig.id} className="p-4 text-sm text-graphite-muted">
                  {new Intl.DateTimeFormat("cs-CZ").format(gig.date)} · {gig.city}{gig.place ? ` · ${gig.place}` : ""} · {gig.band.name}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
