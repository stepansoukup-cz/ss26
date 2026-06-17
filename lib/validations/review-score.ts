import { z } from "zod";

/** Slider 0 → null; 1–10 → celé číslo v DB. */
export const reviewScoreFieldSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const num = Number(value);
  if (num === 0) {
    return null;
  }

  return num;
}, z.union([z.null(), z.number().int().min(1, "Skóre musí být 1–10.").max(10, "Skóre musí být 1–10.")]));

export const reviewScoresFormSchema = z.object({
  scoreLegacy: reviewScoreFieldSchema,
  scorePracticality: reviewScoreFieldSchema,
  scorePrice: reviewScoreFieldSchema,
  scoreSound: reviewScoreFieldSchema,
  scoreLook: reviewScoreFieldSchema,
});

export type ReviewScoresFormInput = z.infer<typeof reviewScoresFormSchema>;
