"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/app/admin/actions";
import { requireUser } from "@/lib/auth/user";
import {
  deleteCloudinaryImage,
  publicIdFromCloudinaryUrl,
  uploadImageToCloudinary,
} from "@/lib/cloudinary-upload";
import { IMAGE_OPTIMIZE_PRESETS } from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";
import { slugifyTitle } from "@/lib/slug";
import { gearFormSchema, gearPrivateInfoSchema } from "@/lib/validations/gear";
import { getImageFileFromFormData } from "@/lib/validations/media";

function formatZodError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Neplatná data.";
}

function revalidateGearPaths(id?: string) {
  revalidatePath("/gear");
  revalidatePath("/admin/gear");
  if (id) {
    revalidatePath(`/gear/${id}`);
    revalidatePath(`/admin/gear/${id}`);
  }
}

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

async function resolveCategoryId(categoryId: string, newCategoryName: string | null) {
  if (categoryId !== "__new") {
    return categoryId;
  }

  if (!newCategoryName) {
    throw new Error("Zadej název nové kategorie.");
  }

  const slug = slugifyTitle(newCategoryName);
  const category = await prisma.category.upsert({
    where: { slug },
    create: { name: newCategoryName, slug, position: 999 },
    update: { name: newCategoryName },
  });

  return category.id;
}

async function resolveGroupId(groupId: string | null, newGroupName: string | null) {
  if (groupId === "__new") {
    if (!newGroupName) {
      throw new Error("Zadej název nové skupiny stejných kusů.");
    }
    const group = await prisma.gearGroup.create({ data: { name: newGroupName } });
    return group.id;
  }
  return groupId || null;
}

export async function saveGearAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = gearFormSchema.safeParse({
    id: formData.get("id") || "",
    brand: formData.get("brand") ?? "",
    model: formData.get("model") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    newCategoryName: formData.get("newCategoryName") ?? "",
    note: formData.get("note") ?? "",
    boughtAt: formData.get("boughtAt") ?? "",
    soldAt: formData.get("soldAt") ?? "",
    inDrawer: formData.get("inDrawer") === "1",
    purchaseUrl: formData.get("purchaseUrl") ?? "",
    eshopUrl: formData.get("eshopUrl") ?? "",
    listingUrl: formData.get("listingUrl") ?? "",
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    removeCover: formData.get("removeCover") === "1",
    containerId: formData.get("containerId") ?? "",
    sameModelGroupId: formData.get("sameModelGroupId") ?? "",
    newGroupName: formData.get("newGroupName") ?? "",
  });
  const privateParsed = gearPrivateInfoSchema.safeParse({
    serial: formData.get("serial") ?? "",
    purchasePrice: formData.get("purchasePrice") ?? "",
    sellPrice: formData.get("sellPrice") ?? "",
    sellerName: formData.get("sellerName") ?? "",
    sellerPhone: formData.get("sellerPhone") ?? "",
    sellerEmail: formData.get("sellerEmail") ?? "",
    sellerCity: formData.get("sellerCity") ?? "",
    sellerFb: formData.get("sellerFb") ?? "",
    buyerName: formData.get("buyerName") ?? "",
    buyerPhone: formData.get("buyerPhone") ?? "",
    buyerEmail: formData.get("buyerEmail") ?? "",
    buyerAddress: formData.get("buyerAddress") ?? "",
    buyerFb: formData.get("buyerFb") ?? "",
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }
  if (!privateParsed.success) {
    return { error: formatZodError(privateParsed.error) };
  }

  try {
    const data = parsed.data;
    const existing = data.id
      ? await prisma.gear.findUnique({ where: { id: data.id } })
      : null;
    const coverFile = formData.get("coverFile");
    const fileResult =
      coverFile instanceof File && coverFile.size > 0
        ? getImageFileFromFormData(formData, "coverFile")
        : null;

    if (fileResult && "error" in fileResult) {
      return { error: fileResult.error };
    }

    const categoryId = await resolveCategoryId(data.categoryId, data.newCategoryName);
    const sameModelGroupId = await resolveGroupId(
      data.sameModelGroupId,
      data.newGroupName,
    );
    const containerId = data.containerId || null;

    if (data.id && containerId === data.id) {
      return { error: "Gear nemůže být součástí sám sebe." };
    }

    let coverImageUrl = data.coverImageUrl;
    let coverImagePublicId = data.coverImageUrl
      ? publicIdFromCloudinaryUrl(data.coverImageUrl)?.publicId ?? null
      : null;

    if (fileResult && "file" in fileResult) {
      const uploaded = await uploadImageToCloudinary(
        fileResult.file,
        `ss26/gear/${data.id || "new"}`,
        { optimize: IMAGE_OPTIMIZE_PRESETS.gallery },
      );
      coverImageUrl = uploaded.url;
      coverImagePublicId = uploaded.publicId;
    } else if (data.removeCover) {
      coverImageUrl = null;
      coverImagePublicId = null;
    }

    if (
      existing?.coverImagePublicId &&
      (data.removeCover || existing.coverImagePublicId !== coverImagePublicId)
    ) {
      await deleteCloudinaryImage(existing.coverImagePublicId);
    }

    const privateInfo = privateParsed.data;
    const articleId = formData.get("articleId");
    const linkedArticleId =
      typeof articleId === "string" && articleId.trim() ? articleId.trim() : null;

    const gearData = {
      brand: data.brand,
      model: data.model,
      categoryId,
      note: data.note,
      boughtAt: data.boughtAt,
      soldAt: data.soldAt,
      inDrawer: data.inDrawer,
      purchaseUrl: data.purchaseUrl,
      eshopUrl: data.eshopUrl,
      listingUrl: data.soldAt ? null : data.listingUrl,
      coverImageUrl,
      coverImagePublicId,
      containerId,
      sameModelGroupId,
    };

    const gear = await prisma.$transaction(async (tx) => {
      const saved = data.id
        ? await tx.gear.update({ where: { id: data.id }, data: gearData })
        : await tx.gear.create({ data: gearData });

      await tx.gearPrivateInfo.upsert({
        where: { gearId: saved.id },
        create: { gearId: saved.id, ...privateInfo },
        update: privateInfo,
      });

      await tx.articleGear.deleteMany({ where: { gearId: saved.id } });
      if (linkedArticleId) {
        await tx.articleGear.create({
          data: { articleId: linkedArticleId, gearId: saved.id },
        });
      }

      return saved;
    });

    revalidateGearPaths(gear.id);
    redirect(`/admin/gear/${gear.id}?saved=1`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return {
      error:
        error instanceof Error ? error.message : "Gear se nepodařilo uložit.",
    };
  }
}

export async function deleteGearAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return;
  }

  const gear = await prisma.gear.findUnique({
    where: { id },
    select: { coverImagePublicId: true },
  });
  if (!gear) {
    return;
  }

  if (gear.coverImagePublicId) {
    await deleteCloudinaryImage(gear.coverImagePublicId);
  }

  await prisma.gear.delete({ where: { id } });
  revalidateGearPaths(id);
  redirect("/admin/gear?deleted=1");
}
