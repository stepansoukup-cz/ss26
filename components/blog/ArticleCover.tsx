export function ArticleCover({
  src,
  alt,
  priority = false,
  interactive = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  interactive?: boolean;
}) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-graphite-border bg-graphite-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className={`h-full w-full object-cover${interactive ? " transition duration-300 group-hover:scale-[1.02]" : ""}`}
      />
    </div>
  );
}

export function ArticleVideoCover({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-graphite-border bg-black">
      <video
        src={src}
        controls
        className="h-full w-full object-cover"
        title={title}
      />
    </div>
  );
}
