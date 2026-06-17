import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProfileSettings } from "@/components/admin/ProfileSettings";
import { getCurrentUser } from "@/lib/auth/user";

export default async function AdminProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/prihlaseni");
  }

  return (
    <AdminShell
      title="Můj profil"
      description="Osobní údaje, avatar a heslo k administraci."
    >
      <ProfileSettings user={user} />
    </AdminShell>
  );
}
