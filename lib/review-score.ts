export const REVIEW_CRITERIA = [
  { key: "scoreLegacy", label: "Legacy" },
  { key: "scorePracticality", label: "Praktičnost" },
  { key: "scorePrice", label: "Cena" },
  { key: "scoreSound", label: "Zvuk" },
  { key: "scoreLook", label: "Vzhled" },
] as const;

export type ReviewScoreKey = (typeof REVIEW_CRITERIA)[number]["key"];

export type ReviewScores = Record<ReviewScoreKey, number | null>;

export const EMPTY_REVIEW_SCORES: ReviewScores = {
  scoreLegacy: null,
  scorePracticality: null,
  scorePrice: null,
  scoreSound: null,
  scoreLook: null,
};

/** Hodnota slideru 0 = nehodnoceno (null), 1–10 = skóre v DB. */
export function sliderValueToScore(value: number): number | null {
  if (value === 0) {
    return null;
  }

  if (Number.isInteger(value) && value >= 1 && value <= 10) {
    return value;
  }

  return null;
}

/** Null v DB → slider na 0 (šedý / nehodnoceno). */
export function scoreToSliderValue(score: number | null | undefined): number {
  if (score == null) {
    return 0;
  }

  return score;
}

export function hasAnyReviewScore(scores: ReviewScores): boolean {
  return REVIEW_CRITERIA.some(({ key }) => scores[key] != null);
}

/** Aritmetický průměr z vyplněných kritérií; žádné → null; jinak jedno desetinné místo. */
export function calculateReviewOverall(
  scores: ReviewScores,
): number | null {
  const values = REVIEW_CRITERIA.map(({ key }) => scores[key]).filter(
    (value): value is number => value != null,
  );

  if (values.length === 0) {
    return null;
  }

  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round(average * 10) / 10;
}

export function formatReviewScore(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export function reviewScoresFromArticle(article: {
  scoreLegacy: number | null;
  scorePracticality: number | null;
  scorePrice: number | null;
  scoreSound: number | null;
  scoreLook: number | null;
}): ReviewScores {
  return {
    scoreLegacy: article.scoreLegacy,
    scorePracticality: article.scorePracticality,
    scorePrice: article.scorePrice,
    scoreSound: article.scoreSound,
    scoreLook: article.scoreLook,
  };
}
