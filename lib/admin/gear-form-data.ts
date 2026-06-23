import "server-only";

import { ArticleStatus } from "@prisma/client";
import { getGearCategories } from "@/lib/gear-categories";
import { prisma } from "@/lib/prisma";

export async function getGearFormOptions(excludeGearId?: string) {
  const [categories, containers, groups, articles] = await Promise.all([
    getGearCategories(),
    prisma.gear.findMany({
      where: excludeGearId ? { NOT: { id: excludeGearId } } : {},
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      select: { id: true, brand: true, model: true },
    }),
    prisma.gearGroup.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  return {
    categories,
    containers: containers.map((gear) => ({
      id: gear.id,
      name: `${gear.brand} ${gear.model}`,
    })),
    groups,
    articles,
  };
}

export function dateInputValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}
