import { MediaType } from "@prisma/client";
import { cloudinary, ensureCloudinaryConfig } from "@/lib/cloudinary";
import { optimizeImageFile } from "@/lib/image-optimize";
import {
  IMAGE_OPTIMIZE_PRESETS,
  maxImageUploadErrorMessage,
  type ImageOptimizePreset,
} from "@/lib/image-upload";

export type CloudinaryResourceType = "image" | "video" | "raw";

export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: CloudinaryResourceType = "image",
) {
  ensureCloudinaryConfig();

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch {
    // Soubor už mohl být smazaný ručně.
  }
}

export function publicIdFromCloudinaryUrl(
  url: string,
): { publicId: string; resourceType: CloudinaryResourceType } | null {
  if (!url.includes("res.cloudinary.com")) {
    return null;
  }

  const match = url.match(
    /\/(image|video|raw)\/upload\/(?:[^/]+\/)*(?:v\d+\/)?([^?#]+)$/,
  );

  if (!match) {
    return null;
  }

  const resourceType = match[1] as CloudinaryResourceType;
  const publicId = match[2].replace(/\.[^/.?#]+$/, "").split("?")[0];

  if (!publicId) {
    return null;
  }

  return { publicId, resourceType };
}

export function mediaTypeToCloudinaryResource(
  type: MediaType,
): CloudinaryResourceType {
  switch (type) {
    case MediaType.VIDEO:
      return "video";
    case MediaType.AUDIO:
      return "video";
    default:
      return "image";
  }
}

export async function deleteCloudinaryByPrefix(prefix: string) {
  ensureCloudinaryConfig();

  for (const resourceType of ["image", "video"] as const) {
    try {
      await cloudinary.api.delete_resources_by_prefix(prefix, {
        resource_type: resourceType,
      });
    } catch {
      // Prefix nemusí existovat nebo je už prázdný.
    }
  }
}

export type UploadedImage = {
  url: string;
  publicId: string;
};

type UploadImageOptions = {
  /** Před nahráním zmenší a převede na WebP (doporučeno). */
  optimize?: ImageOptimizePreset;
};

export async function uploadImageToCloudinary(
  file: File,
  folder: string,
  options: UploadImageOptions = {},
) {
  ensureCloudinaryConfig();

  const optimizePreset = options.optimize ?? IMAGE_OPTIMIZE_PRESETS.cover;
  const optimized = await optimizeImageFile(file, optimizePreset);

  const dataUri = `data:${optimized.mimeType};base64,${optimized.buffer.toString("base64")}`;

  let result;
  try {
    result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: "image",
      overwrite: true,
      format: "webp",
    });
  } catch (error) {
    throw new Error(formatCloudinaryUploadError(error));
  }

  if (!result.secure_url || !result.public_id) {
    throw new Error("Cloudinary nevrátilo URL nahraného souboru.");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  } satisfies UploadedImage;
}

export function formatCloudinaryUploadError(error: unknown) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("too large") || message.includes("max bytes")) {
    return maxImageUploadErrorMessage();
  }

  if (
    message.includes("invalid") ||
    message.includes("format") ||
    message.includes("not an image")
  ) {
    return "Nepodporovaný formát obrázku. Použij JPEG, PNG, WebP nebo GIF.";
  }

  if (message.includes("nepodařilo zpracovat") || message.includes("platný obrázek")) {
    return error instanceof Error
      ? error.message
      : "Obrázek se nepodařilo zpracovat.";
  }

  if (message.includes("cloudinary") && message.includes("config")) {
    return "Chyba připojení k Cloudinary. Zkontroluj nastavení na serveru.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Obrázek se nepodařilo nahrát. Zkus to znovu nebo použij jiný soubor.";
}

export async function deleteCloudinaryImage(publicId: string) {
  return deleteCloudinaryAsset(publicId, "image");
}
