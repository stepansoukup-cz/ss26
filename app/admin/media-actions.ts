"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/user";
import {
  deleteCloudinaryImage,
  uploadImageToCloudinary,
} from "@/lib/cloudinary-upload";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { IMAGE_OPTIMIZE_PRESETS } from "@/lib/image-upload";
import { getImageFileFromFormData } from "@/lib/validations/media";
import {
  updateSiteNameSchema,
  updateSiteSocialsSchema,
} from "@/lib/validations/site";
import type { ActionState } from "@/app/admin/actions";

function formatZodError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Neplatná data.";
}

function revalidateAdminSettings() {
  revalidatePath("/admin/profil");
  revalidatePath("/admin/nastaveni-webu");
}

export async function uploadAvatarAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const fileResult = getImageFileFromFormData(formData);

  if ("error" in fileResult) {
    return { error: fileResult.error };
  }

  try {
    const uploaded = await uploadImageToCloudinary(
      fileResult.file,
      `ss26/avatars/${user.id}`,
      { optimize: IMAGE_OPTIMIZE_PRESETS.avatar },
    );

    const dbUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { avatarPublicId: true },
    });

    if (dbUser.avatarPublicId) {
      await deleteCloudinaryImage(dbUser.avatarPublicId);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: uploaded.url,
        avatarPublicId: uploaded.publicId,
      },
    });

    revalidateAdminSettings();
    return { success: "Avatar byl nahrán." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Avatar se nepodařilo nahrát.",
    };
  }
}

export async function removeAvatarAction(): Promise<ActionState> {
  const user = await requireUser();

  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { avatarPublicId: true },
  });

  if (dbUser.avatarPublicId) {
    await deleteCloudinaryImage(dbUser.avatarPublicId);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      avatarUrl: null,
      avatarPublicId: null,
    },
  });

  revalidateAdminSettings();
  return { success: "Avatar byl odstraněn." };
}

export async function updateSiteNameAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = updateSiteNameSchema.safeParse({
    siteName: formData.get("siteName"),
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      siteName: parsed.data.siteName,
    },
    update: {
      siteName: parsed.data.siteName,
    },
  });

  revalidateAdminSettings();
  return { success: "Název webu byl uložen." };
}

export async function updateSiteSocialsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const parsed = updateSiteSocialsSchema.safeParse({
    facebookUrl: formData.get("facebookUrl"),
    instagramUrl: formData.get("instagramUrl"),
    spotifyUrl: formData.get("spotifyUrl"),
    youtubeUrl: formData.get("youtubeUrl"),
    tiktokUrl: formData.get("tiktokUrl"),
    contactEmail: formData.get("contactEmail"),
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      siteName: "stepansoukup.cz",
      ...parsed.data,
    },
    update: parsed.data,
  });

  revalidateAdminSettings();
  return { success: "Sociální profily a kontakt byly uloženy." };
}

export async function uploadSiteLogoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const fileResult = getImageFileFromFormData(formData);

  if ("error" in fileResult) {
    return { error: fileResult.error };
  }

  try {
    const uploaded = await uploadImageToCloudinary(
      fileResult.file,
      "ss26/site/logo",
      { optimize: IMAGE_OPTIMIZE_PRESETS.logo },
    );

    const settings = await getSiteSettings();

    if (settings.logoPublicId) {
      await deleteCloudinaryImage(settings.logoPublicId);
    }

    await prisma.siteSettings.update({
      where: { id: "main" },
      data: {
        logoUrl: uploaded.url,
        logoPublicId: uploaded.publicId,
      },
    });

    revalidateAdminSettings();
    return { success: "Logo bylo nahráno." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Logo se nepodařilo nahrát.",
    };
  }
}

export async function removeSiteLogoAction(): Promise<ActionState> {
  await requireUser();
  const settings = await getSiteSettings();

  if (settings.logoPublicId) {
    await deleteCloudinaryImage(settings.logoPublicId);
  }

  await prisma.siteSettings.update({
    where: { id: "main" },
    data: {
      logoUrl: null,
      logoPublicId: null,
    },
  });

  revalidateAdminSettings();
  return { success: "Logo bylo odstraněno." };
}

export async function removeAvatarFormAction(
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  return removeAvatarAction();
}

export async function removeSiteLogoFormAction(
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  return removeSiteLogoAction();
}
