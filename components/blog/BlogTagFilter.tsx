import Link from "next/link";

type Tag = { name: string; slug: string };

function buildHref(selected: string[]) {
  if (selected.length === 0) {
    return "/";
  }
  const params = new URLSearchParams();
  for (const slug of selected) {
    params.append("tag", slug);
  }
  return `/?${params.toString()}`;
}

export function BlogTagFilter({
  tags,
  selected,
}: {
  tags: Tag[];
  selected: string[];
}) {
  if (tags.length === 0) {
    return null;
  }

  const selectedSet = new Set(selected);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/"
        className={`rounded-full border px-3 py-1.5 text-sm transition ${
          selected.length === 0
            ? "border-graphite-accent bg-graphite-accent/15 text-graphite-accent"
            : "border-graphite-border text-graphite-muted hover:border-graphite-accent hover:text-graphite-text"
        }`}
      >
        Vše
      </Link>

      {tags.map((tag) => {
        const active = selectedSet.has(tag.slug);
        const next = active
          ? selected.filter((slug) => slug !== tag.slug)
          : [...selected, tag.slug];

        return (
          <Link
            key={tag.slug}
            href={buildHref(next)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              active
                ? "border-graphite-accent bg-graphite-accent/15 text-graphite-accent"
                : "border-graphite-border text-graphite-muted hover:border-graphite-accent hover:text-graphite-text"
            }`}
          >
            {tag.name}
          </Link>
        );
      })}
    </div>
  );
}
