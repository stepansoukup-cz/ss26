import "server-only";

import { prisma } from "@/lib/prisma";

export function dateInputValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export async function getGigFormOptions() {
  const [bands, gear] = await Promise.all([
    prisma.band.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.gear.findMany({
      where: { containerId: null, inDrawer: false },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      select: {
        id: true,
        brand: true,
        model: true,
        boughtAt: true,
        soldAt: true,
        category: { select: { name: true } },
        containedGear: { select: { id: true } },
      },
    }),
  ]);

  return {
    bands,
    gearOptions: gear.map((item) => ({
      id: item.id,
      label: `${item.brand} ${item.model}`,
      category: item.category?.name ?? "Bez kategorie",
      boughtAt: item.boughtAt?.toISOString() ?? null,
      soldAt: item.soldAt?.toISOString() ?? null,
      childCount: item.containedGear.length,
    })),
  };
}
