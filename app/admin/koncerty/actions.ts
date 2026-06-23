"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/app/admin/actions";
import { requireUser } from "@/lib/auth/user";
import { expandGearSelectionWithCurrentContainerContents } from "@/lib/gear-stats";
import { prisma } from "@/lib/prisma";
import { gigFormSchema } from "@/lib/validations/gear";

function formatZodError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Neplatná data.";
}

async function resolveBandId(bandId: string, newBandName: string | null) {
  if (bandId !== "__new") return bandId;
  if (!newBandName) throw new Error("Zadej název nové kapely.");
  const band = await prisma.band.upsert({
    where: { name: newBandName },
    create: { name: newBandName },
    update: {},
  });
  return band.id;
}

function revalidateGigPaths(id?: string) {
  revalidatePath("/koncerty");
  revalidatePath("/admin/koncerty");
  if (id) revalidatePath(`/admin/koncerty/${id}`);
}

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function saveGigAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = gigFormSchema.safeParse({
    id: formData.get("id") || "",
    date: formData.get("date"),
    city: formData.get("city"),
    place: formData.get("place") ?? "",
    name: formData.get("name") ?? "",
    bandId: formData.get("bandId"),
    newBandName: formData.get("newBandName") ?? "",
    note: formData.get("note") ?? "",
    photosUrl: formData.get("photosUrl") ?? "",
    recordingUrl: formData.get("recordingUrl") ?? "",
    youtubeUrl: formData.get("youtubeUrl") ?? "",
  });
  if (!parsed.success) return { error: formatZodError(parsed.error) };

  try {
    const data = parsed.data;
    const bandId = await resolveBandId(data.bandId, data.newBandName);
    const selectedGearIds = formData
      .getAll("gearIds")
      .filter((value): value is string => typeof value === "string" && Boolean(value));
    const expandedGearIds = await expandGearSelectionWithCurrentContainerContents(
      selectedGearIds,
      data.date,
    );

    const gig = await prisma.$transaction(async (tx) => {
      const saved = data.id
        ? await tx.gig.update({
            where: { id: data.id },
            data: {
              date: data.date,
              city: data.city,
              place: data.place,
              name: data.name,
              bandId,
              note: data.note,
              photosUrl: data.photosUrl,
              recordingUrl: data.recordingUrl,
              youtubeUrl: data.youtubeUrl,
            },
          })
        : await tx.gig.create({
            data: {
              date: data.date,
              city: data.city,
              place: data.place,
              name: data.name,
              bandId,
              note: data.note,
              photosUrl: data.photosUrl,
              recordingUrl: data.recordingUrl,
              youtubeUrl: data.youtubeUrl,
            },
          });

      await tx.gearOnGig.deleteMany({ where: { gigId: saved.id } });
      if (expandedGearIds.length) {
        await tx.gearOnGig.createMany({
          data: expandedGearIds.map((gearId) => ({ gearId, gigId: saved.id })),
          skipDuplicates: true,
        });
      }
      return saved;
    });

    revalidateGigPaths(gig.id);
    redirect(`/admin/koncerty/${gig.id}?saved=1`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      error:
        error instanceof Error ? error.message : "Koncert se nepodařilo uložit.",
    };
  }
}

function parseImportDate(value: string) {
  const match = value.trim().match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]), 20, 0, 0);
}

export async function importGigsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const bandId = formData.get("bandId");
  const linesRaw = formData.get("lines");
  if (typeof bandId !== "string" || !bandId) return { error: "Vyber kapelu." };
  if (typeof linesRaw !== "string" || !linesRaw.trim()) return { error: "Vlož řádky importu." };

  const rows = linesRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s*[|,]\s*/));

  const data = rows.map((parts) => {
    const date = parseImportDate(parts[0] ?? "");
    if (!date || !parts[1]) throw new Error(`Neplatný řádek: ${parts.join(" | ")}`);
    return {
      date,
      city: parts[1].trim(),
      place: parts[2]?.trim() || null,
      bandId,
    };
  });

  await prisma.gig.createMany({ data });
  revalidateGigPaths();
  return { success: `Importováno ${data.length} koncertů.` };
}

export async function importGigsFormAction(formData: FormData): Promise<void> {
  await importGigsAction({}, formData);
}

export async function deleteGigAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;
  await prisma.gig.delete({ where: { id } });
  revalidateGigPaths(id);
  redirect("/admin/koncerty?deleted=1");
}
