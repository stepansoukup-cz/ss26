"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/user";
import { uploadAudioToCloudinary } from "@/lib/cloudinary-upload";
import {
  CONTENT_BLOCK_TYPE,
  MEDIA_TYPE,
  type AudioMediaItem,
} from "@/lib/content-block-constants";
import {
  createContentBlock,
  deleteContentBlockWithAssets,
  deleteMediaAssets,
} from "@/lib/content-blocks";
import { prisma } from "@/lib/prisma";
import {
  getAudioFileFromFormData,
  sanitizeAudioCaption,
} from "@/lib/validations/audio";

async function requireAudioBlock(articleId: string, blockId: string) {
  const block = await prisma.contentBlock.findFirst({
    where: {
      id: blockId,
      articleId,
      type: CONTENT_BLOCK_TYPE.AUDIO_PLAYER,
    },
    select: { id: true, article: { select: { slug: true } } },
  });

  if (!block) {
    throw new Error("Přehrávač nebyl nalezen.");
  }

  return block;
}

function revalidateArticle(articleId: string, slug: string) {
  revalidatePath(`/admin/clanky/${articleId}`);
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
}

export async function createAudioPlayerBlockAction(articleId: string) {
  await requireUser();

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, slug: true },
  });

  if (!article) {
    throw new Error("Článek nebyl nalezen.");
  }

  const block = await createContentBlock(
    articleId,
    CONTENT_BLOCK_TYPE.AUDIO_PLAYER,
  );
  revalidateArticle(articleId, article.slug);
  return { blockId: block.id };
}

export async function getAudioMediaAction(
  blockId: string,
): Promise<AudioMediaItem[]> {
  await requireUser();

  return prisma.media.findMany({
    where: { blockId, type: MEDIA_TYPE.AUDIO },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      url: true,
      publicId: true,
      caption: true,
      position: true,
    },
  });
}

export async function uploadAudioTrackAction(
  articleId: string,
  blockId: string,
  formData: FormData,
) {
  await requireUser();
  const block = await requireAudioBlock(articleId, blockId);

  const fileResult = getAudioFileFromFormData(formData, "file");
  if ("error" in fileResult) {
    return { error: fileResult.error };
  }

  try {
    const folder = `ss26/articles/${articleId}/blocks/${blockId}`;
    const uploaded = await uploadAudioToCloudinary(fileResult.file, folder);

    const last = await prisma.media.findFirst({
      where: { blockId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const media = await prisma.media.create({
      data: {
        articleId,
        blockId,
        type: MEDIA_TYPE.AUDIO,
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
          : "Audio se nepodařilo nahrát.",
    };
  }
}

export async function deleteAudioTrackAction(mediaId: string) {
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

  if (!media?.blockId || !media.block || media.type !== MEDIA_TYPE.AUDIO) {
    return { error: "Stopa nebyla nalezena." };
  }

  await deleteMediaAssets([media]);
  await prisma.media.delete({ where: { id: mediaId } });

  revalidateArticle(media.block.articleId, media.block.article.slug);
  return { success: true as const };
}

export async function reorderAudioMediaAction(
  blockId: string,
  mediaIds: string[],
) {
  await requireUser();

  const block = await prisma.contentBlock.findUnique({
    where: { id: blockId },
    include: {
      media: { where: { type: MEDIA_TYPE.AUDIO }, select: { id: true } },
      article: { select: { id: true, slug: true } },
    },
  });

  if (!block || block.type !== CONTENT_BLOCK_TYPE.AUDIO_PLAYER) {
    return { error: "Přehrávač nebyl nalezen." };
  }

  const validIds = new Set(block.media.map((item) => item.id));
  if (
    mediaIds.length !== validIds.size ||
    mediaIds.some((id) => !validIds.has(id))
  ) {
    return { error: "Neplatné pořadí stop." };
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

export async function updateAudioTrackCaptionAction(
  mediaId: string,
  caption: string,
) {
  await requireUser();

  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      block: {
        select: {
          articleId: true,
          article: { select: { slug: true } },
        },
      },
    },
  });

  if (!media?.blockId || !media.block || media.type !== MEDIA_TYPE.AUDIO) {
    return { error: "Stopa nebyla nalezena." };
  }

  const nextCaption = sanitizeAudioCaption(caption);

  const updated = await prisma.media.update({
    where: { id: mediaId },
    data: { caption: nextCaption || null },
    select: {
      id: true,
      url: true,
      publicId: true,
      caption: true,
      position: true,
    },
  });

  revalidateArticle(media.block.articleId, media.block.article.slug);
  return { media: updated };
}

export async function deleteAudioPlayerBlockAction(blockId: string) {
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
    return { error: "Přehrávač nebyl nalezen." };
  }

  await deleteContentBlockWithAssets(blockId);
  revalidateArticle(block.articleId, block.article.slug);
  return { success: true as const };
}
