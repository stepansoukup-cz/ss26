"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ArticleStatus, CoverType } from "@prisma/client";
import type { ActionState } from "@/app/admin/actions";
import { requireUser } from "@/lib/auth/user";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import { IMAGE_OPTIMIZE_PRESETS } from "@/lib/image-upload";
import { deleteArticleCloudinaryAssets } from "@/lib/articles/delete-article-assets";
import {
  coverImagePublicIdFromUrl,
  deleteArticleCoverImage,
} from "@/lib/articles/cover-image";
import { DELETE_ARTICLE_CONFIRMATION_TEXT } from "@/lib/admin/article-delete";
import { prisma } from "@/lib/prisma";
import { sanitizeArticleDocForStorage } from "@/lib/sanitize-article-doc";
import { extractBlockIds, parseArticleDoc } from "@/lib/article-doc";
import { syncOrphanContentBlocks } from "@/lib/content-blocks";
import { syncArticleTags, deleteOrphanTags } from "@/lib/tags";
import { articleFormSchema } from "@/lib/validations/article";
import { getImageFileFromFormData } from "@/lib/validations/media";

function formatZodError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Neplatná data.";
}

function revalidateArticlePaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/admin/clanky");
  revalidatePath(`/blog/${slug}`);
}

export async function saveArticleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = articleFormSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    perex: formData.get("perex"),
    content: formData.get("content"),
    coverType: formData.get("coverType"),
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    coverVideoUrl: formData.get("coverVideoUrl") ?? "",
    status: formData.get("status"),
    scoreLegacy: formData.get("scoreLegacy"),
    scorePracticality: formData.get("scorePracticality"),
    scorePrice: formData.get("scorePrice"),
    scoreSound: formData.get("scoreSound"),
    scoreLook: formData.get("scoreLook"),
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const data = parsed.data;
  const tagNames = formData.getAll("tags").map((value) => String(value));
  const removeCover = formData.get("removeCover") === "1";
  const coverFile = formData.get("coverFile");
  const fileResult =
    coverFile instanceof File && coverFile.size > 0
      ? getImageFileFromFormData(formData, "coverFile")
      : null;

  if (fileResult && "error" in fileResult) {
    return { error: fileResult.error };
  }

  const existing = data.id
    ? await prisma.article.findUnique({ where: { id: data.id } })
    : null;

  if (data.id && !existing) {
    return { error: "Článek nebyl nalezen." };
  }

  let coverImageUrl: string | null = null;
  let coverVideoUrl: string | null = null;
  let coverImagePublicId: string | null = null;
  let coverVideoPublicId: string | null = null;

  if (data.coverType === CoverType.IMAGE) {
    coverVideoUrl = null;
    coverVideoPublicId = null;

    const hasNewFile = fileResult && "file" in fileResult;
    const wantsRemoveCover =
      removeCover ||
      Boolean(
        data.id &&
          !hasNewFile &&
          !data.coverImageUrl &&
          existing?.coverImageUrl,
      );

    if (hasNewFile) {
      try {
        const folder = data.id
          ? `ss26/articles/${data.id}`
          : `ss26/articles/draft-${data.slug}`;
        const uploaded = await uploadImageToCloudinary(fileResult.file, folder, {
          optimize: IMAGE_OPTIMIZE_PRESETS.cover,
        });
        coverImageUrl = uploaded.url;
        coverImagePublicId = uploaded.publicId;

        if (existing?.coverImageUrl || existing?.coverImagePublicId) {
          const sameAsset =
            existing.coverImagePublicId === coverImagePublicId ||
            existing.coverImageUrl === coverImageUrl;

          if (!sameAsset) {
            await deleteArticleCoverImage(
              existing.coverImagePublicId,
              existing.coverImageUrl,
            );
          }
        }
      } catch (error) {
        return {
          error:
            error instanceof Error
              ? error.message
              : "Cover obrázek se nepodařilo nahrát.",
        };
      }
    } else if (wantsRemoveCover) {
      await deleteArticleCoverImage(
        existing?.coverImagePublicId,
        existing?.coverImageUrl,
      );
      coverImageUrl = null;
      coverImagePublicId = null;
    } else if (data.coverImageUrl) {
      const urlChanged = existing?.coverImageUrl !== data.coverImageUrl;

      if (urlChanged && (existing?.coverImageUrl || existing?.coverImagePublicId)) {
        await deleteArticleCoverImage(
          existing.coverImagePublicId,
          existing.coverImageUrl,
        );
      }

      coverImageUrl = data.coverImageUrl;
      coverImagePublicId = coverImagePublicIdFromUrl(data.coverImageUrl);
    } else if (existing?.coverImageUrl) {
      coverImageUrl = existing.coverImageUrl;
      coverImagePublicId = existing.coverImagePublicId ?? null;
    }
  } else {
    if (existing?.coverType === CoverType.IMAGE) {
      await deleteArticleCoverImage(
        existing.coverImagePublicId,
        existing.coverImageUrl,
      );
    }

    coverImageUrl = null;
    coverImagePublicId = null;
    coverVideoUrl = data.coverVideoUrl || existing?.coverVideoUrl || null;
    coverVideoPublicId = existing?.coverVideoPublicId ?? null;
  }

  const slugTaken = await prisma.article.findFirst({
    where: {
      slug: data.slug,
      ...(data.id ? { NOT: { id: data.id } } : {}),
    },
    select: { id: true },
  });

  if (slugTaken) {
    return { error: "Článek s tímto slugem už existuje." };
  }

  let publishedAt = existing?.publishedAt ?? null;
  if (data.status === ArticleStatus.PUBLISHED && !publishedAt) {
    publishedAt = new Date();
  }

  const contentRaw = typeof formData.get("content") === "string" ? formData.get("content") as string : "";
  const sanitizedContent = sanitizeArticleDocForStorage(contentRaw);
  if (contentRaw.trim() && !sanitizedContent) {
    return { error: "Obsah článku není platný JSON dokument." };
  }

  const articleData = {
    title: data.title,
    slug: data.slug,
    perex: data.perex,
    content: sanitizedContent,
    coverType: data.coverType,
    coverImageUrl,
    coverImagePublicId,
    coverVideoUrl,
    coverVideoPublicId,
    scoreLegacy: data.scoreLegacy,
    scorePracticality: data.scorePracticality,
    scorePrice: data.scorePrice,
    scoreSound: data.scoreSound,
    scoreLook: data.scoreLook,
    status: data.status,
    publishedAt,
  };

  const article = data.id
    ? await prisma.article.update({
        where: { id: data.id },
        data: articleData,
      })
    : await prisma.article.create({
        data: {
          ...articleData,
          authorId: user.id,
        },
      });

  await syncArticleTags(article.id, tagNames);

  const blockIds = sanitizedContent
    ? extractBlockIds(parseArticleDoc(sanitizedContent))
    : [];
  await syncOrphanContentBlocks(article.id, blockIds);

  revalidateArticlePaths(article.slug);
  if (existing && existing.slug !== article.slug) {
    revalidatePath(`/blog/${existing.slug}`);
  }
  redirect(`/admin/clanky/${article.id}?saved=1`);
}

export async function deleteArticleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const articleId = formData.get("articleId");
  const confirmation = formData.get("confirmation");

  if (typeof articleId !== "string" || !articleId) {
    return { error: "Chybí identifikátor článku." };
  }

  if (confirmation !== DELETE_ARTICLE_CONFIRMATION_TEXT) {
    return {
      error: "Pro smazání musíš potvrdit, že si uvědomuješ nenávratnost akce.",
    };
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      media: {
        select: { publicId: true, type: true, url: true },
      },
    },
  });

  if (!article) {
    return { error: "Článek nebyl nalezen." };
  }

  const slug = article.slug;

  await deleteArticleCloudinaryAssets(article);

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { articleId } }),
    prisma.articleTag.deleteMany({ where: { articleId } }),
    prisma.contentBlock.deleteMany({ where: { articleId } }),
    prisma.media.deleteMany({ where: { articleId } }),
    prisma.article.delete({ where: { id: articleId } }),
  ]);

  await deleteOrphanTags();

  revalidateArticlePaths(slug);
  redirect("/admin/clanky?deleted=1");
}
