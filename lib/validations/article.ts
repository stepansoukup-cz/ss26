import { ArticleStatus, CoverType } from "@prisma/client";
import { z } from "zod";
import { reviewScoresFormSchema } from "@/lib/validations/review-score";

export const articleFormSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(1, "Titulek je povinný."),
    slug: z
      .string()
      .trim()
      .min(1, "Slug je povinný.")
      .max(120, "Slug může mít nejvýše 120 znaků.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug smí obsahovat jen malá písmena, čísla a pomlčky.",
      ),
    perex: z.string().trim().min(1, "Perex je povinný."),
    content: z.string(),
    coverType: z.nativeEnum(CoverType),
    coverImageUrl: z.string().trim(),
    coverVideoUrl: z.string().trim(),
    status: z.nativeEnum(ArticleStatus),
  })
  .merge(reviewScoresFormSchema)
  .superRefine((data, ctx) => {
    if (data.coverType === CoverType.IMAGE && data.coverImageUrl) {
      try {
        new URL(data.coverImageUrl);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "URL cover obrázku není platná.",
          path: ["coverImageUrl"],
        });
      }
    }

    if (data.coverType === CoverType.VIDEO && data.coverVideoUrl) {
      try {
        new URL(data.coverVideoUrl);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: "URL cover videa není platná.",
          path: ["coverVideoUrl"],
        });
      }
    }
  });

import type { ReviewScores } from "@/lib/review-score";
import { EMPTY_REVIEW_SCORES } from "@/lib/review-score";

export type ArticleFormInput = z.infer<typeof articleFormSchema>;

export type ArticleFormDefaults = {
  id: string;
  title: string;
  slug: string;
  perex: string;
  content: string;
  coverType: CoverType;
  coverImageUrl: string;
  coverVideoUrl: string;
  status: ArticleStatus;
  reviewScores?: ReviewScores;
  tags?: string[];
};

export const EMPTY_ARTICLE_REVIEW_SCORES = EMPTY_REVIEW_SCORES;
