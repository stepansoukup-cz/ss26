import {
  REVIEW_CRITERIA,
  calculateReviewOverall,
  formatReviewScore,
  hasAnyReviewScore,
  type ReviewScores,
} from "@/lib/review-score";

export function ArticleReviewScores({ scores }: { scores: ReviewScores }) {
  if (!hasAnyReviewScore(scores)) {
    return null;
  }

  const overall = calculateReviewOverall(scores);
  if (overall == null) {
    return null;
  }

  const filledCriteria = REVIEW_CRITERIA.filter(({ key }) => scores[key] != null);

  return (
    <section
      className="rounded-xl border border-graphite-border bg-graphite-surface px-5 py-6 sm:px-6"
      aria-label="Hodnocení recenze"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-graphite-border pb-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-graphite-muted">
          Hodnocení
        </h2>
        <p className="text-right">
          <span className="block text-xs uppercase tracking-[0.14em] text-graphite-muted">
            Celkově
          </span>
          <span className="text-3xl font-medium tabular-nums tracking-tight text-graphite-accent sm:text-4xl">
            {formatReviewScore(overall)}
            <span className="text-lg text-graphite-muted sm:text-xl">/10</span>
          </span>
        </p>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {filledCriteria.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 rounded-lg border border-graphite-border/80 bg-graphite-bg/40 px-4 py-3"
          >
            <dt className="text-sm text-graphite-muted">{label}</dt>
            <dd className="text-sm font-medium tabular-nums text-graphite-text">
              {scores[key]}/10
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
