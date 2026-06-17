import {
  deleteCloudinaryImage,
  publicIdFromCloudinaryUrl,
} from "@/lib/cloudinary-upload";

/** Smaže cover obrázek článku z Cloudinary (podle publicId nebo URL). */
export async function deleteArticleCoverImage(
  publicId: string | null | undefined,
  url: string | null | undefined,
) {
  if (publicId) {
    await deleteCloudinaryImage(publicId);
    return;
  }

  const fromUrl = url ? publicIdFromCloudinaryUrl(url) : null;
  if (fromUrl?.resourceType === "image") {
    await deleteCloudinaryImage(fromUrl.publicId);
  }
}

export function coverImagePublicIdFromUrl(url: string) {
  const parsed = publicIdFromCloudinaryUrl(url);
  if (!parsed || parsed.resourceType !== "image") {
    return null;
  }

  return parsed.publicId;
}
