import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { GearForm } from "@/components/admin/GearForm";
import { getGearFormOptions, dateInputValue } from "@/lib/admin/gear-form-data";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function privateDefaults(privateInfo: Record<string, unknown> | null) {
  const keys = [
    "serial",
    "purchasePrice",
    "sellPrice",
    "sellerName",
    "sellerPhone",
    "sellerEmail",
    "sellerCity",
    "sellerFb",
    "buyerName",
    "buyerPhone",
    "buyerEmail",
    "buyerAddress",
    "buyerFb",
  ];

  return Object.fromEntries(
    keys.map((key) => [
      key,
      privateInfo?.[key] == null ? "" : String(privateInfo[key]),
    ]),
  );
}

export default async function EditGearPage({
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
  const gear = await prisma.gear.findUnique({
    where: { id },
    include: {
      privateInfo: true,
      articleLinks: { select: { articleId: true }, take: 1 },
    },
  });

  if (!gear) notFound();
  const options = await getGearFormOptions(gear.id);

  return (
    <AdminShell title="Upravit gear" description={`${gear.brand} ${gear.model}`}>
      <GearForm
        saved={query.saved === "1"}
        defaults={{
          id: gear.id,
          brand: gear.brand,
          model: gear.model,
          categoryId: gear.categoryId ?? "",
          note: gear.note ?? "",
          boughtAt: dateInputValue(gear.boughtAt),
          soldAt: dateInputValue(gear.soldAt),
          inDrawer: gear.inDrawer,
          purchaseUrl: gear.purchaseUrl ?? "",
          eshopUrl: gear.eshopUrl ?? "",
          listingUrl: gear.soldAt ? "" : gear.listingUrl ?? "",
          coverImageUrl: gear.coverImageUrl ?? "",
          containerId: gear.containerId ?? "",
          sameModelGroupId: gear.sameModelGroupId ?? "",
          privateInfo: privateDefaults(gear.privateInfo),
          articleId: gear.articleLinks[0]?.articleId ?? "",
        }}
        {...options}
      />
    </AdminShell>
  );
}
