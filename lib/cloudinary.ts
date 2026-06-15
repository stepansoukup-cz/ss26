import { v2 as cloudinary } from "cloudinary";

function getCloudinaryConfig() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Chybí CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY nebo CLOUDINARY_API_SECRET v .env.local.",
    );
  }

  return { cloud_name, api_key, api_secret };
}

let configured = false;

function ensureCloudinaryConfig() {
  if (configured) {
    return;
  }

  const config = getCloudinaryConfig();
  cloudinary.config({
    ...config,
    secure: true,
  });
  configured = true;
}

export async function pingCloudinary(timeoutMs = 15_000) {
  ensureCloudinaryConfig();

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          `Cloudinary API neodpovědělo do ${timeoutMs} ms. Zkontroluj síť nebo firewall.`,
        ),
      );
    }, timeoutMs);
  });

  return Promise.race([
    cloudinary.api.ping({ timeout: timeoutMs }),
    timeout,
  ]);
}

export { cloudinary, ensureCloudinaryConfig };
