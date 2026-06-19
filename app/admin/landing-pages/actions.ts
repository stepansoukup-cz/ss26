"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/user";
import {
  defaultLandingPages,
  landingPageLabels,
  type LandingPageContent,
  type LandingPageSlug,
} from "@/lib/landing-pages";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/app/admin/actions";

function parseText(value: FormDataEntryValue | null, fallback: string) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}

function parseOptionalUrl(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    return null;
  }
  if (!/^https?:\/\/.+/i.test(text)) {
    throw new Error("URL obrázku musí začínat http:// nebo https://.");
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

function isLandingPageSlug(value: FormDataEntryValue | null): value is LandingPageSlug {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(defaultLandingPages, value)
  );
}

function buildContent(slug: LandingPageSlug, formData: FormData): LandingPageContent {
  const fallback = defaultLandingPages[slug];

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
    },
    sections: fallback.sections.map((section, index) => ({
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
      imageUrl: parseOptionalUrl(formData.get(`sections.${index}.imageUrl`)),
    })),
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
    const content = buildContent(slug, formData);
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
