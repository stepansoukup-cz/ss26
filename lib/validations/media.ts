const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;

export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Povolené formáty: JPEG, PNG, WebP, GIF.";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "Soubor je příliš velký (max. 4 MB).";
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
