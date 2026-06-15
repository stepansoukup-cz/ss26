import { cloudinary, ensureCloudinaryConfig } from "@/lib/cloudinary";

export type UploadedImage = {
  url: string;
  publicId: string;
};

export async function uploadImageToCloudinary(
  file: File,
  folder: string,
  transformation?: Record<string, unknown>,
) {
  ensureCloudinaryConfig();

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    overwrite: true,
    ...(transformation ? { transformation } : {}),
  });

  if (!result.secure_url || !result.public_id) {
    throw new Error("Cloudinary nevrátilo URL nahraného souboru.");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
  } satisfies UploadedImage;
}

export async function deleteCloudinaryImage(publicId: string) {
  ensureCloudinaryConfig();

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    // Soubor už mohl být smazaný ručně v Cloudinary.
  }
}
