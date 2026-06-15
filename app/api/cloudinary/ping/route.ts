import { NextResponse } from "next/server";
import { pingCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    const result = await pingCloudinary();

    return NextResponse.json({
      ok: true,
      message: "Připojení ke Cloudinary funguje.",
      cloudinary: result,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Neznámá chyba při ověření.";

    return NextResponse.json(
      {
        ok: false,
        message: "Připojení ke Cloudinary selhalo.",
        error: message,
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}
