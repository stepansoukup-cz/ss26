import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { GearForm } from "@/components/admin/GearForm";
import { getCurrentUser } from "@/lib/auth/user";
import { getGearFormOptions } from "@/lib/admin/gear-form-data";

export default async function NewGearPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/prihlaseni");
  const options = await getGearFormOptions();

  return (
    <AdminShell title="Nový gear" description="Založ nový kus vybavení.">
      <GearForm
        defaults={{
          brand: "",
          model: "",
          categoryId: "",
          note: "",
          boughtAt: "",
          soldAt: "",
          inDrawer: false,
          purchaseUrl: "",
          eshopUrl: "",
          listingUrl: "",
          coverImageUrl: "",
          containerId: "",
          sameModelGroupId: "",
          privateInfo: {},
          articleId: "",
        }}
        {...options}
      />
    </AdminShell>
  );
}
