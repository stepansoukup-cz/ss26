"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cloudinaryGalleryDisplayUrl } from "@/lib/cloudinary-transform";

export type GalleryImage = {
  id: string;
  url: string;
  caption: string | null;
};

export function ArticleGalleryLightbox({
  images,
}: {
  images: GalleryImage[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  const showPrevious = useCallback(() => {
    setOpenIndex((index) =>
      index === null ? null : (index - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setOpenIndex((index) =>
      index === null ? null : (index + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (openIndex === null) {
      return;
    }

    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
      if (event.key === "ArrowLeft") {
        showPrevious();
      }
      if (event.key === "ArrowRight") {
        showNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex, close, showNext, showPrevious]);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="article-gallery-grid">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="article-gallery-item"
            onClick={() => setOpenIndex(index)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryGalleryDisplayUrl(image.url, 900)}
              alt={image.caption ?? `Fotka ${index + 1}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {openIndex !== null ? (
        <div
          className="article-gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Galerie fotek"
        >
          <button
            type="button"
            className="article-gallery-lightbox-backdrop"
            aria-label="Zavřít galerii"
            onClick={close}
          />
          <div className="article-gallery-lightbox-panel">
            <button
              ref={closeButtonRef}
              type="button"
              className="article-gallery-lightbox-close"
              onClick={close}
            >
              Zavřít
            </button>
            <button
              type="button"
              className="article-gallery-lightbox-nav article-gallery-lightbox-nav-prev"
              aria-label="Předchozí fotka"
              onClick={showPrevious}
            >
              ←
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryGalleryDisplayUrl(images[openIndex].url, 1600)}
              alt={images[openIndex].caption ?? `Fotka ${openIndex + 1}`}
              className="article-gallery-lightbox-image"
            />
            <button
              type="button"
              className="article-gallery-lightbox-nav article-gallery-lightbox-nav-next"
              aria-label="Další fotka"
              onClick={showNext}
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
