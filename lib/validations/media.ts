import {
  MAX_IMAGE_UPLOAD_BYTES,
  maxImageUploadErrorMessage,
} from "@/lib/image-upload";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/** @deprecated Použij MAX_IMAGE_UPLOAD_BYTES z lib/image-upload.ts */
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_UPLOAD_BYTES;

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Povolené formáty: JPEG, PNG, WebP, GIF.";
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return maxImageUploadErrorMessage();
  }

  if (file.size === 0) {
    return "Soubor je prázdný.";
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
