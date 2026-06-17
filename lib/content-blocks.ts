import { ContentBlockType, MediaType } from "@prisma/client";
import {
  deleteCloudinaryAsset,
  mediaTypeToCloudinaryResource,
} from "@/lib/cloudinary-upload";
import { prisma } from "@/lib/prisma";

export async function createContentBlock(
  articleId: string,
  type: ContentBlockType,
) {
  return prisma.contentBlock.create({
    data: { articleId, type },
  });
}

export async function deleteMediaAssets(
  media: Array<{ publicId: string; type: MediaType }>,
) {
  for (const item of media) {
    await deleteCloudinaryAsset(
      item.publicId,
      mediaTypeToCloudinaryResource(item.type),
    );
  }
}

export async function deleteContentBlockWithAssets(blockId: string) {
  const block = await prisma.contentBlock.findUnique({
    where: { id: blockId },
    include: { media: true },
  });

  if (!block) {
    return;
  }

  await deleteMediaAssets(block.media);
  await prisma.contentBlock.delete({ where: { id: blockId } });
}

export async function syncOrphanContentBlocks(
  articleId: string,
  referencedBlockIds: string[],
) {
  const orphans = await prisma.contentBlock.findMany({
    where: {
      articleId,
      ...(referencedBlockIds.length > 0
        ? { id: { notIn: referencedBlockIds } }
        : {}),
    },
    include: { media: true },
  });

  for (const block of orphans) {
    await deleteMediaAssets(block.media);
  }

  await prisma.contentBlock.deleteMany({
    where: {
      articleId,
      ...(referencedBlockIds.length > 0
        ? { id: { notIn: referencedBlockIds } }
        : {}),
    },
  });
}

export async function getGalleryMediaForBlocks(blockIds: string[]) {
  if (blockIds.length === 0) {
    return new Map<string, GalleryMediaItem[]>();
  }

  const rows = await prisma.media.findMany({
    where: {
      blockId: { in: blockIds },
      type: MediaType.IMAGE,
    },
    orderBy: [{ blockId: "asc" }, { position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      blockId: true,
      url: true,
      publicId: true,
      caption: true,
      position: true,
    },
  });

  const map = new Map<string, GalleryMediaItem[]>();
  for (const row of rows) {
    if (!row.blockId) {
      continue;
    }
    const list = map.get(row.blockId) ?? [];
    list.push({
      id: row.id,
      url: row.url,
      publicId: row.publicId,
      caption: row.caption,
      position: row.position,
    });
    map.set(row.blockId, list);
  }

  return map;
}

export type GalleryMediaItem = {
  id: string;
  url: string;
  publicId: string;
  caption: string | null;
  position: number;
};
