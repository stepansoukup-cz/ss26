import "server-only";

import { prisma } from "@/lib/prisma";
import { slugifyTitle } from "@/lib/slug";

export const DEFAULT_GEAR_CATEGORIES = [
  "Akustika",
  "Aparát",
  "Baskytara",
  "Bezdrát",
  "Box",
  "Buffer",
  "Delay",
  "Digital",
  "Ekvalizer",
  "Kytara",
  "Loadbox",
  "Multiswitch",
  "Multizdroj",
  "Overdrive",
  "Patchbay",
  "Pedalboard",
  "Power Amp",
  "Snímače",
  "Tuner",
] as const;

export async function ensureDefaultGearCategories() {
  await Promise.all(
    DEFAULT_GEAR_CATEGORIES.map((name, index) =>
      prisma.category.upsert({
        where: { slug: slugifyTitle(name) },
        create: {
          name,
          slug: slugifyTitle(name),
          position: (index + 1) * 10,
        },
        update: {
          name,
          position: (index + 1) * 10,
        },
      }),
    ),
  );
}

export async function getGearCategories() {
  await ensureDefaultGearCategories();
  return prisma.category.findMany({
    orderBy: [{ name: "asc" }],
    select: { id: true, name: true, slug: true },
  });
}
