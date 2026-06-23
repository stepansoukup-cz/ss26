import { PublicHeader } from "@/components/site/PublicHeader";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function ConcertsPage() {
  const gigs = await prisma.gig.findMany({
    orderBy: { date: "desc" },
    include: { band: true },
  });

  return (
    <div className="min-h-full bg-graphite-bg text-graphite-text">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-graphite-accent">Koncerty</p>
        <h1 className="mt-4 text-4xl font-medium tracking-tight sm:text-6xl">Koncerty</h1>
        <div className="mt-10 divide-y divide-graphite-border rounded-[1.5rem] border border-graphite-border bg-graphite-surface">
          {gigs.map((gig) => (
            <article key={gig.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-graphite-accent">{formatDate(gig.date)}</p>
                  <h2 className="mt-1 text-xl font-medium text-white">
                    {gig.city}{gig.place ? ` · ${gig.place}` : ""}
                  </h2>
                  <p className="mt-1 text-sm text-graphite-muted">
                    {gig.band.name}{gig.name ? ` · ${gig.name}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  {gig.photosUrl ? <a href={gig.photosUrl} className="rounded-full border border-graphite-border px-3 py-1 text-graphite-muted hover:text-white">Fotky</a> : null}
                  {gig.recordingUrl ? <a href={gig.recordingUrl} className="rounded-full border border-graphite-border px-3 py-1 text-graphite-muted hover:text-white">Záznam</a> : null}
                  {gig.youtubeUrl ? <a href={gig.youtubeUrl} className="rounded-full border border-graphite-border px-3 py-1 text-graphite-muted hover:text-white">YouTube</a> : null}
                </div>
              </div>
            </article>
          ))}
          {gigs.length === 0 ? (
            <p className="p-8 text-center text-graphite-muted">Zatím žádné koncerty.</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
