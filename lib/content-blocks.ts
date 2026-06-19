import "server-only";

import type { ContentBlockType, MediaType } from "@prisma/client";
import {
  deleteCloudinaryAsset,
  mediaTypeToCloudinaryResource,
} from "@/lib/cloudinary-upload";
import { MEDIA_TYPE } from "@/lib/content-block-constants";
import { prisma } from "@/lib/prisma";

import type {
  BlockMediaMaps,
  GalleryMediaItem,
} from "@/lib/content-block-constants";

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

function pushMediaItem(
  map: Map<string, GalleryMediaItem[]>,
  blockId: string,
  item: GalleryMediaItem,
) {
  const list = map.get(blockId) ?? [];
  list.push(item);
  map.set(blockId, list);
}

export async function getBlockMediaForRender(
  blockIds: string[],
): Promise<BlockMediaMaps> {
  const empty: BlockMediaMaps = {
    gallery: new Map(),
    audio: new Map(),
  };

  if (blockIds.length === 0) {
    return empty;
  }

  const rows = await prisma.media.findMany({
    where: {
      blockId: { in: blockIds },
      type: { in: [MEDIA_TYPE.IMAGE, MEDIA_TYPE.AUDIO] },
    },
    orderBy: [{ blockId: "asc" }, { position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      blockId: true,
      type: true,
      url: true,
      publicId: true,
      caption: true,
      position: true,
    },
  });

  for (const row of rows) {
    if (!row.blockId) {
      continue;
    }

    const item = {
      id: row.id,
      url: row.url,
      publicId: row.publicId,
      caption: row.caption,
      position: row.position,
    };

    if (row.type === MEDIA_TYPE.IMAGE) {
      pushMediaItem(empty.gallery, row.blockId, item);
    } else if (row.type === MEDIA_TYPE.AUDIO) {
      pushMediaItem(empty.audio, row.blockId, item);
    }
  }

  return empty;
}

export async function getGalleryMediaForBlocks(blockIds: string[]) {
  const { gallery } = await getBlockMediaForRender(blockIds);
  return gallery;
}
