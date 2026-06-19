import type { GalleryMediaItem } from "@/lib/content-block-constants";
import {
  ArticleGalleryLightbox,
  type GalleryImage,
} from "@/components/blog/ArticleGalleryLightbox";

export function ArticleGallery({
  images,
}: {
  images: GalleryMediaItem[];
}) {
  if (images.length === 0) {
    return null;
  }

  const galleryImages: GalleryImage[] = images.map((item) => ({
    id: item.id,
    url: item.url,
    caption: item.caption,
  }));

  return (
    <figure className="article-gallery my-8">
      <ArticleGalleryLightbox images={galleryImages} />
    </figure>
  );
}
