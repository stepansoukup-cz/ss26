import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { LandingPagesPanel } from "@/components/admin/LandingPagesPanel";
import { getCurrentUser } from "@/lib/auth/user";
import {
  getLandingPageContent,
  landingPageLabels,
  type LandingPageSlug,
} from "@/lib/landing-pages";

export const dynamic = "force-dynamic";

const slugs: LandingPageSlug[] = ["webove-aplikace", "nahravani"];

export default async function AdminLandingPagesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/prihlaseni");
  }

  const pages = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      label: landingPageLabels[slug],
      content: await getLandingPageContent(slug),
    })),
  );

  return (
    <AdminShell
      title="Landing pages"
      description="Texty a obrázky pro veřejné onepage stránky."
    >
      <LandingPagesPanel pages={pages} />
    </AdminShell>
  );
}
