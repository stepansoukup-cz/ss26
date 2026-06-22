import {
  MAX_IMAGE_UPLOAD_BYTES,
  maxImageUploadErrorMessage,
} from "@/lib/image-upload";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/** @deprecated Použij MAX_IMAGE_UPLOAD_BYTES z lib/image-upload.ts */
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_UPLOAD_BYTES;

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Povolené formáty: JPEG, PNG, WebP.";
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return maxImageUploadErrorMessage();
  }

  if (file.size === 0) {
    return "Soubor je prázdný.";
  }

  return null;
}

const ALLOWED_IMAGE_EXTS = new Set(["jpg", "png", "webp"]);

export async function checkImageMagicBytes(buffer: Buffer): Promise<string | null> {
  const { fileTypeFromBuffer } = await import("file-type");
  const type = await fileTypeFromBuffer(buffer);
  if (!type || !ALLOWED_IMAGE_EXTS.has(type.ext)) {
    return "Soubor není platný obrázek. Povolené formáty: JPEG, PNG, WebP.";
  }
  return null;
}

export function getImageFileFromFormData(formData: FormData, fieldName = "file") {
  const value = formData.get(fieldName);

  if (!(value instanceof File)) {
    return { error: "Vyber obrázek k nahrání." };
  }

  const validationError = validateImageFile(value);
  if (validationError) {
    return { error: validationError };
  }

  return { file: value };
}
