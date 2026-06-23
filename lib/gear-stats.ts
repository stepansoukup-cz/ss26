import "server-only";

import { prisma } from "@/lib/prisma";

export type GearStats = {
  gigCount: number;
  ownershipDays: number | null;
};

type GearDates = {
  id: string;
  boughtAt: Date | null;
  soldAt: Date | null;
};

function daysBetween(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function ownershipDays(gear: Pick<GearDates, "boughtAt" | "soldAt">) {
  if (!gear.boughtAt) {
    return null;
  }
  return daysBetween(gear.boughtAt, gear.soldAt ?? new Date());
}

export async function getGearStats(gear: GearDates): Promise<GearStats> {
  const gigCount = await prisma.gearOnGig.count({
    where: { gearId: gear.id },
  });

  return {
    gigCount,
    ownershipDays: ownershipDays(gear),
  };
}

export async function getGearStatsMap(gearItems: GearDates[]) {
  const counts = await prisma.gearOnGig.groupBy({
    by: ["gearId"],
    where: { gearId: { in: gearItems.map((gear) => gear.id) } },
    _count: { gigId: true },
  });
  const countMap = new Map(
    counts.map((item) => [item.gearId, item._count.gigId]),
  );

  return new Map(
    gearItems.map((gear) => [
      gear.id,
      {
        gigCount: countMap.get(gear.id) ?? 0,
        ownershipDays: ownershipDays(gear),
      } satisfies GearStats,
    ]),
  );
}

export async function getSameModelGroupStats(groupId: string): Promise<GearStats> {
  const members = await prisma.gear.findMany({
    where: { sameModelGroupId: groupId },
    select: { id: true, boughtAt: true, soldAt: true },
  });
  const stats = await getGearStatsMap(members);

  return members.reduce<GearStats>(
    (sum, member) => {
      const item = stats.get(member.id);
      return {
        gigCount: sum.gigCount + (item?.gigCount ?? 0),
        ownershipDays:
          sum.ownershipDays === null && item?.ownershipDays === null
            ? null
            : (sum.ownershipDays ?? 0) + (item?.ownershipDays ?? 0),
      };
    },
    { gigCount: 0, ownershipDays: null },
  );
}

export async function getAvailableMainGearForGig(date: Date) {
  return prisma.gear.findMany({
    where: {
      containerId: null,
      inDrawer: false,
      OR: [{ boughtAt: null }, { boughtAt: { lte: date } }],
      AND: [{ OR: [{ soldAt: null }, { soldAt: { gte: date } }] }],
    },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
    include: {
      category: { select: { name: true } },
      containedGear: {
        where: {
          inDrawer: false,
          OR: [{ boughtAt: null }, { boughtAt: { lte: date } }],
          AND: [{ OR: [{ soldAt: null }, { soldAt: { gte: date } }] }],
        },
        select: { id: true },
      },
    },
  });
}

export async function expandGearSelectionWithCurrentContainerContents(
  gearIds: string[],
  date: Date,
) {
  if (gearIds.length === 0) {
    return [];
  }

  const selected = await prisma.gear.findMany({
    where: { id: { in: gearIds } },
    select: {
      id: true,
      containedGear: {
        where: {
          inDrawer: false,
          OR: [{ boughtAt: null }, { boughtAt: { lte: date } }],
          AND: [{ OR: [{ soldAt: null }, { soldAt: { gte: date } }] }],
        },
        select: { id: true },
      },
    },
  });

  return Array.from(
    new Set(
      selected.flatMap((gear) => [
        gear.id,
        ...gear.containedGear.map((child) => child.id),
      ]),
    ),
  );
}
