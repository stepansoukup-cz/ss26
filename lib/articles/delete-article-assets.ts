import { CoverType, MediaType } from "@prisma/client";
import {
  deleteCloudinaryAsset,
  deleteCloudinaryByPrefix,
  publicIdFromCloudinaryUrl,
  mediaTypeToCloudinaryResource,
} from "@/lib/cloudinary-upload";

type ArticleForCleanup = {
  id: string;
  slug: string;
  coverType: CoverType;
  coverImageUrl: string | null;
  coverImagePublicId: string | null;
  coverVideoUrl: string | null;
  coverVideoPublicId: string | null;
  media: Array<{
    publicId: string;
    type: MediaType;
    url: string;
  }>;
};

async function deleteUniqueAsset(
  seen: Set<string>,
  publicId: string | null | undefined,
  resourceType: "image" | "video" | "raw",
) {
  if (!publicId) {
    return;
  }

  const key = `${resourceType}:${publicId}`;
  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  await deleteCloudinaryAsset(publicId, resourceType);
}

export async function deleteArticleCloudinaryAssets(article: ArticleForCleanup) {
  const seen = new Set<string>();

  for (const item of article.media) {
    await deleteUniqueAsset(seen, item.publicId, mediaTypeToCloudinaryResource(item.type));

    const fromUrl = publicIdFromCloudinaryUrl(item.url);
    if (fromUrl) {
      await deleteUniqueAsset(seen, fromUrl.publicId, fromUrl.resourceType);
    }
  }

  if (article.coverType === CoverType.IMAGE) {
    await deleteUniqueAsset(seen, article.coverImagePublicId, "image");

    const fromUrl = article.coverImageUrl
      ? publicIdFromCloudinaryUrl(article.coverImageUrl)
      : null;
    if (fromUrl) {
      await deleteUniqueAsset(seen, fromUrl.publicId, fromUrl.resourceType);
    }
  } else {
    await deleteUniqueAsset(seen, article.coverVideoPublicId, "video");

    const fromUrl = article.coverVideoUrl
      ? publicIdFromCloudinaryUrl(article.coverVideoUrl)
      : null;
    if (fromUrl) {
      await deleteUniqueAsset(seen, fromUrl.publicId, fromUrl.resourceType);
    }
  }

  await deleteCloudinaryByPrefix(`ss26/articles/${article.id}`);
  await deleteCloudinaryByPrefix(`ss26/articles/draft-${article.slug}`);
}
