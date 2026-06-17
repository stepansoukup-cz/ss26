import { prisma } from "@/lib/prisma";
import { slugifyTitle } from "@/lib/slug";

export const MAX_TAG_LENGTH = 40;
export const MAX_TAGS_PER_ARTICLE = 20;

export type NormalizedTag = { name: string; slug: string };

/** Vyčistí jedno jméno štítku (ořez, sloučení mezer, bez úvodního #). */
export function normalizeTagName(raw: string): string | null {
  const cleaned = raw
    .replace(/^#+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TAG_LENGTH);

  if (!cleaned) {
    return null;
  }

  // Musí dát neprázdný slug (jinak by šlo o samé oddělovače/emoji).
  if (!slugifyTitle(cleaned)) {
    return null;
  }

  return cleaned;
}

/** Z pole syrových jmen udělá unikátní seznam {name, slug} (dedupe podle slugu). */
export function normalizeTagList(raw: string[]): NormalizedTag[] {
  const seen = new Set<string>();
  const result: NormalizedTag[] = [];

  for (const item of raw) {
    const name = normalizeTagName(item);
    if (!name) {
      continue;
    }

    const slug = slugifyTitle(name);
    if (!slug || seen.has(slug)) {
      continue;
    }

    seen.add(slug);
    result.push({ name, slug });

    if (result.length >= MAX_TAGS_PER_ARTICLE) {
      break;
    }
  }

  return result;
}

/**
 * Nastaví štítky článku podle zadaných jmen:
 * - existující štítek se znovu použije (podle slugu), nový se vytvoří,
 * - odebrané vazby se smažou,
 * - na konci se uklidí osamocené štítky (bez jediného článku).
 */
export async function syncArticleTags(articleId: string, rawNames: string[]) {
  const tags = normalizeTagList(rawNames);

  const tagIds: string[] = [];
  for (const { name, slug } of tags) {
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name, slug },
      update: {},
    });
    tagIds.push(tag.id);
  }

  const existing = await prisma.articleTag.findMany({
    where: { articleId },
    select: { tagId: true },
  });
  const existingIds = new Set(existing.map((row) => row.tagId));
  const nextIds = new Set(tagIds);

  const toAdd = tagIds.filter((id) => !existingIds.has(id));
  const toRemove = [...existingIds].filter((id) => !nextIds.has(id));

  await prisma.$transaction([
    ...(toRemove.length
      ? [
          prisma.articleTag.deleteMany({
            where: { articleId, tagId: { in: toRemove } },
          }),
        ]
      : []),
    ...toAdd.map((tagId) =>
      prisma.articleTag.create({ data: { articleId, tagId } }),
    ),
  ]);

  await deleteOrphanTags();
}

/** Smaže štítky, které nejsou u žádného článku. */
export async function deleteOrphanTags() {
  await prisma.tag.deleteMany({
    where: { articleTags: { none: {} } },
  });
}

/** Štítky použité aspoň u jednoho PUBLIKOVANÉHO článku (pro veřejný filtr). */
export async function getPublishedTags() {
  return prisma.tag.findMany({
    where: {
      articleTags: { some: { article: { status: "PUBLISHED" } } },
    },
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });
}
