import { pingCloudinary } from "../lib/cloudinary";

const TIMEOUT_MS = 15_000;

async function main() {
  const startedAt = Date.now();
  console.log("Spouštím Cloudinary ping test…");
  console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ?? "(chybí)"}`);
  console.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? "nastaven" : "(chybí)"}`);
  console.log(
    `CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? "nastaven" : "(chybí)"}`,
  );

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          `Timeout po ${TIMEOUT_MS} ms — Cloudinary API neodpovědělo včas.`,
        ),
      );
    }, TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([pingCloudinary(), timeout]);
    const durationMs = Date.now() - startedAt;

    console.log("OK — připojení funguje.");
    console.log("Odpověď:", result);
    console.log(`Doba odezvy: ${durationMs} ms`);
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    console.error("CHYBA — ping selhal.");
    console.error(error instanceof Error ? error.message : error);
    console.error(`Doba do chyby: ${durationMs} ms`);
    process.exit(1);
  }
}

main();
