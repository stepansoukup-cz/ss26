"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/user";
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload";
import {
  defaultLandingPages,
  landingPageLabels,
  type LandingPageContent,
  type LandingPageSlug,
} from "@/lib/landing-pages";
import { IMAGE_OPTIMIZE_PRESETS } from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";
import { validateImageFile } from "@/lib/validations/media";
import type { ActionState } from "@/app/admin/actions";

function parseText(value: FormDataEntryValue | null, fallback: string) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

function parseOptionalUrl(value: FormDataEntryValue | null, label = "URL") {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    return null;
  }
  if (!/^https?:\/\/.+/i.test(text)) {
    throw new Error(`${label} musí začínat http:// nebo https://.`);
  }
  return text;
}

function parseLines(value: FormDataEntryValue | null, fallback: string[]) {
  const lines =
    typeof value === "string"
      ? value
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean)
      : [];
  return lines.length ? lines : fallback;
}

function parseOptionalUrlLines(
  value: FormDataEntryValue | null,
  fallback: string[],
  label: string,
) {
  const lines = parseLines(value, fallback);
  for (const line of lines) {
    if (!/^https?:\/\/.+/i.test(line)) {
      throw new Error(`${label} musí obsahovat jen URL začínající http:// nebo https://.`);
    }
  }
  return lines;
}

function optionalImageFile(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }
  const error = validateImageFile(value);
  if (error) {
    throw new Error(error);
  }
  return value;
}

function optionalImageFiles(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .filter((value): value is File => value instanceof File && value.size > 0)
    .map((file) => {
      const error = validateImageFile(file);
      if (error) {
        throw new Error(error);
      }
      return file;
    });
}

async function uploadOptionalImage(
  formData: FormData,
  fieldName: string,
  folder: string,
) {
  const file = optionalImageFile(formData, fieldName);
  if (!file) {
    return null;
  }

  const uploaded = await uploadImageToCloudinary(file, folder, {
    optimize: IMAGE_OPTIMIZE_PRESETS.gallery,
  });
  return uploaded.url;
}

async function uploadOptionalImages(
  formData: FormData,
  fieldName: string,
  folder: string,
) {
  const files = optionalImageFiles(formData, fieldName).slice(0, 3);
  const uploads = await Promise.all(
    files.map((file) =>
      uploadImageToCloudinary(file, folder, {
        optimize: IMAGE_OPTIMIZE_PRESETS.gallery,
      }),
    ),
  );
  return uploads.map((upload) => upload.url);
}

function isLandingPageSlug(value: FormDataEntryValue | null): value is LandingPageSlug {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(defaultLandingPages, value)
  );
}

async function buildContent(
  slug: LandingPageSlug,
  formData: FormData,
): Promise<LandingPageContent> {
  const fallback = defaultLandingPages[slug];
  const heroImageUpload = await uploadOptionalImage(
    formData,
    "hero.imageFile",
    `ss26/landing-pages/${slug}/hero`,
  );

  return {
    hero: {
      eyebrow: parseText(formData.get("hero.eyebrow"), fallback.hero.eyebrow),
      title: parseText(formData.get("hero.title"), fallback.hero.title),
      text: parseText(formData.get("hero.text"), fallback.hero.text),
      primaryLabel: parseText(
        formData.get("hero.primaryLabel"),
        fallback.hero.primaryLabel,
      ),
      secondaryLabel: parseText(
        formData.get("hero.secondaryLabel"),
        fallback.hero.secondaryLabel,
      ),
      imageUrl:
        heroImageUpload ??
        parseOptionalUrl(formData.get("hero.imageUrl"), "URL promo fotky") ??
        null,
    },
    sections: await Promise.all(
      fallback.sections.map(async (section, index) => {
        const sectionImageUpload = await uploadOptionalImage(
          formData,
          `sections.${index}.imageFile`,
          `ss26/landing-pages/${slug}/${section.id}`,
        );
        const galleryUploads = await uploadOptionalImages(
          formData,
          `sections.${index}.galleryImageFiles`,
          `ss26/landing-pages/${slug}/${section.id}/gallery`,
        );
        const galleryImageUrls = [
          ...parseOptionalUrlLines(
            formData.get(`sections.${index}.galleryImageUrls`),
            section.galleryImageUrls ?? [],
            "URL fotek",
          ),
          ...galleryUploads,
        ].slice(0, 3);

        return {
          ...section,
          eyebrow: parseText(
            formData.get(`sections.${index}.eyebrow`),
            section.eyebrow,
          ),
          title: parseText(formData.get(`sections.${index}.title`), section.title),
          text: parseText(formData.get(`sections.${index}.text`), section.text),
          bullets: parseLines(
            formData.get(`sections.${index}.bullets`),
            section.bullets,
          ),
          imageUrl:
            sectionImageUpload ??
            parseOptionalUrl(
              formData.get(`sections.${index}.imageUrl`),
              "URL obrázku",
            ),
          linkUrl: parseOptionalUrl(
            formData.get(`sections.${index}.linkUrl`),
            "URL odkazu / embed",
          ),
          galleryImageUrls,
        };
      }),
    ),
    references: {
      eyebrow: parseText(
        formData.get("references.eyebrow"),
        fallback.references.eyebrow,
      ),
      title: parseText(formData.get("references.title"), fallback.references.title),
      text: parseText(formData.get("references.text"), fallback.references.text),
      items: parseLines(formData.get("references.items"), fallback.references.items),
    },
    cta: {
      eyebrow: parseText(formData.get("cta.eyebrow"), fallback.cta.eyebrow),
      title: parseText(formData.get("cta.title"), fallback.cta.title),
      text: parseText(formData.get("cta.text"), fallback.cta.text),
      buttonLabel: parseText(
        formData.get("cta.buttonLabel"),
        fallback.cta.buttonLabel,
      ),
    },
  };
}

export async function updateLandingPageAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const slug = formData.get("slug");
  if (!isLandingPageSlug(slug)) {
    return { error: "Neznámá landing page." };
  }

  try {
    const content = await buildContent(slug, formData);
    await prisma.landingPageContent.upsert({
      where: { slug },
      create: { slug, content },
      update: { content },
    });

    revalidatePath(`/${slug}`);
    revalidatePath("/admin/landing-pages");
    return { success: `${landingPageLabels[slug]} byla uložena.` };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Landing page se nepodařilo uložit.",
    };
  }
}
