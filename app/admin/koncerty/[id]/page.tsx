import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { GigForm } from "@/components/admin/GigForm";
import { dateInputValue, getGigFormOptions } from "@/lib/admin/gig-form-data";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditGigPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/prihlaseni");
  const { id } = await params;
  const query = await searchParams;
  const gig = await prisma.gig.findUnique({
    where: { id },
    include: { gear: { select: { gearId: true } } },
  });
  if (!gig) notFound();
  const options = await getGigFormOptions();

  return (
    <AdminShell title="Upravit koncert" description={`${gig.city} · ${dateInputValue(gig.date)}`}>
      <GigForm
        saved={query.saved === "1"}
        defaults={{
          id: gig.id,
          date: dateInputValue(gig.date),
          city: gig.city,
          place: gig.place ?? "",
          name: gig.name ?? "",
          bandId: gig.bandId,
          note: gig.note ?? "",
          photosUrl: gig.photosUrl ?? "",
          recordingUrl: gig.recordingUrl ?? "",
          youtubeUrl: gig.youtubeUrl ?? "",
          gearIds: gig.gear.map((item) => item.gearId),
        }}
        {...options}
      />
    </AdminShell>
  );
}
