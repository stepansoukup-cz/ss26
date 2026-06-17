export function formatPublishedDate(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function shouldShowArticleUpdated(
  publishedAt: Date | null,
  updatedAt: Date,
) {
  if (!publishedAt) {
    return false;
  }

  return updatedAt.getTime() - publishedAt.getTime() > ONE_DAY_MS;
}
