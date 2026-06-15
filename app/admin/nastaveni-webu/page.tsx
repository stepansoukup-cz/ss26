import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SiteSettingsPanel } from "@/components/admin/SiteSettingsPanel";
import { getCurrentUser } from "@/lib/auth/user";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminSiteSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/prihlaseni");
  }

  const settings = await getSiteSettings();

  return (
    <AdminShell title="Nastavení webu">
      <SiteSettingsPanel settings={settings} />
    </AdminShell>
  );
}
