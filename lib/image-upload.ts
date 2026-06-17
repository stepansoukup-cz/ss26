/** Limity a předvolby pro nahrávání obrázků (serverová optimalizace před Cloudinary). */

export const MAX_IMAGE_UPLOAD_BYTES = 25 * 1024 * 1024;
export const MAX_IMAGE_UPLOAD_MB = 25;

export type ImageOptimizePreset = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
};

export const IMAGE_OPTIMIZE_PRESETS = {
  /** Cover článku — max. Full HD (16:9 se vejde do 1920×1080). */
  cover: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 82,
  },
  /** Avatar — čtvercový náhled, Cloudinary pak ořízne na kruh. */
  avatar: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
  },
  /** Logo webu — zachová čitelnost, ale bez zbytečně obřích souborů. */
  logo: {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 85,
  },
  /** Fotky ve vložené galerii — max. 1600px na delší stranu. */
  gallery: {
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 80,
  },
} as const satisfies Record<string, ImageOptimizePreset>;

export function maxImageUploadErrorMessage() {
  return `Soubor je příliš velký (max. ${MAX_IMAGE_UPLOAD_MB} MB).`;
}

export function coverImageUploadHint() {
  return `JPEG, PNG, WebP nebo GIF do ${MAX_IMAGE_UPLOAD_MB} MB — server obrázek před nahráním zmenší na max. Full HD a optimalizuje.`;
}
