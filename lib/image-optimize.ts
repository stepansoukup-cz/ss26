import sharp from "sharp";
import type { ImageOptimizePreset } from "@/lib/image-upload";

export type OptimizedImage = {
  buffer: Buffer;
  mimeType: "image/webp";
  width: number;
  height: number;
};

export async function optimizeImageFile(
  file: File,
  preset: ImageOptimizePreset,
): Promise<OptimizedImage> {
  const input = Buffer.from(await file.arrayBuffer());

  try {
    const pipeline = sharp(input, { animated: false }).rotate();

    const { width = 0, height = 0 } = await pipeline.metadata();

    if (!width || !height) {
      throw new Error("Soubor neobsahuje platný obrázek.");
    }

    const resized = pipeline.resize(preset.maxWidth, preset.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });

    const buffer = await resized
      .webp({
        quality: preset.quality,
        effort: 4,
      })
      .toBuffer();

    const outputMeta = await sharp(buffer).metadata();

    return {
      buffer,
      mimeType: "image/webp",
      width: outputMeta.width ?? width,
      height: outputMeta.height ?? height,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("platný obrázek")) {
      throw error;
    }

    throw new Error(
      "Obrázek se nepodařilo zpracovat. Zkus jiný soubor (JPEG, PNG, WebP nebo GIF).",
    );
  }
}
