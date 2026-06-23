import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { GigForm } from "@/components/admin/GigForm";
import { getGigFormOptions } from "@/lib/admin/gig-form-data";
import { getCurrentUser } from "@/lib/auth/user";

export default async function NewGigPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/prihlaseni");
  const options = await getGigFormOptions();

  return (
    <AdminShell title="Nový koncert" description="Založ koncert a přiřaď použitý gear.">
      <GigForm
        defaults={{
          date: new Date().toISOString().slice(0, 10),
          city: "",
          place: "",
          name: "",
          bandId: "",
          note: "",
          photosUrl: "",
          recordingUrl: "",
          youtubeUrl: "",
          gearIds: [],
        }}
        {...options}
      />
    </AdminShell>
  );
}
