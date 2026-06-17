"use server";

import { ContentBlockType, MediaType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/user";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import {
  createContentBlock,
  deleteContentBlockWithAssets,
  deleteMediaAssets,
  type GalleryMediaItem,
} from "@/lib/content-blocks";
import { IMAGE_OPTIMIZE_PRESETS } from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";
import { getImageFileFromFormData } from "@/lib/validations/media";

async function requireGalleryBlock(articleId: string, blockId: string) {
  const block = await prisma.contentBlock.findFirst({
    where: {
      id: blockId,
      articleId,
      type: ContentBlockType.GALLERY,
    },
    select: { id: true, article: { select: { slug: true } } },
  });

  if (!block) {
    throw new Error("Galerie nebyla nalezena.");
  }

  return block;
}

function revalidateArticle(articleId: string, slug: string) {
  revalidatePath(`/admin/clanky/${articleId}`);
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
}

export async function createGalleryBlockAction(articleId: string) {
  await requireUser();

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, slug: true },
  });

  if (!article) {
    throw new Error("Článek nebyl nalezen.");
  }

  const block = await createContentBlock(articleId, ContentBlockType.GALLERY);
  revalidateArticle(articleId, article.slug);
  return { blockId: block.id };
}

export async function getGalleryMediaAction(
  blockId: string,
): Promise<GalleryMediaItem[]> {
  await requireUser();

  const rows = await prisma.media.findMany({
    where: { blockId, type: MediaType.IMAGE },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      url: true,
      publicId: true,
      caption: true,
      position: true,
    },
  });

  return rows;
}

export async function uploadGalleryImageAction(
  articleId: string,
  blockId: string,
  formData: FormData,
) {
  await requireUser();
  const block = await requireGalleryBlock(articleId, blockId);

  const fileResult = getImageFileFromFormData(formData, "file");
  if ("error" in fileResult) {
    return { error: fileResult.error };
  }

  try {
    const folder = `ss26/articles/${articleId}/blocks/${blockId}`;
    const uploaded = await uploadImageToCloudinary(fileResult.file, folder, {
      optimize: IMAGE_OPTIMIZE_PRESETS.gallery,
    });

    const last = await prisma.media.findFirst({
      where: { blockId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const media = await prisma.media.create({
      data: {
        articleId,
        blockId,
        type: MediaType.IMAGE,
        url: uploaded.url,
        publicId: uploaded.publicId,
        position: (last?.position ?? -1) + 1,
      },
      select: {
        id: true,
        url: true,
        publicId: true,
        caption: true,
        position: true,
      },
    });

    revalidateArticle(articleId, block.article.slug);
    return { media };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Obrázek se nepodařilo nahrát.",
    };
  }
}

export async function deleteGalleryImageAction(mediaId: string) {
  await requireUser();

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      block: {
        select: {
          id: true,
          articleId: true,
          article: { select: { slug: true } },
        },
      },
    },
  });

  if (!media?.blockId || !media.block) {
    return { error: "Obrázek nebyl nalezen." };
  }

  await deleteMediaAssets([media]);
  await prisma.media.delete({ where: { id: mediaId } });

  revalidateArticle(media.block.articleId, media.block.article.slug);
  return { success: true as const };
}

export async function reorderGalleryMediaAction(
  blockId: string,
  mediaIds: string[],
) {
  await requireUser();

  const block = await prisma.contentBlock.findUnique({
    where: { id: blockId },
    include: {
      media: { select: { id: true } },
      article: { select: { id: true, slug: true } },
    },
  });

  if (!block || block.type !== ContentBlockType.GALLERY) {
    return { error: "Galerie nebyla nalezena." };
  }

  const validIds = new Set(block.media.map((item) => item.id));
  if (
    mediaIds.length !== validIds.size ||
    mediaIds.some((id) => !validIds.has(id))
  ) {
    return { error: "Neplatné pořadí fotek." };
  }

  await prisma.$transaction(
    mediaIds.map((id, index) =>
      prisma.media.update({
        where: { id },
        data: { position: index },
      }),
    ),
  );

  revalidateArticle(block.articleId, block.article.slug);
  return { success: true as const };
}

export async function deleteGalleryBlockAction(blockId: string) {
  await requireUser();

  const block = await prisma.contentBlock.findUnique({
    where: { id: blockId },
    select: {
      id: true,
      articleId: true,
      article: { select: { slug: true } },
    },
  });

  if (!block) {
    return { error: "Galerie nebyla nalezena." };
  }

  await deleteContentBlockWithAssets(blockId);
  revalidateArticle(block.articleId, block.article.slug);
  return { success: true as const };
}
