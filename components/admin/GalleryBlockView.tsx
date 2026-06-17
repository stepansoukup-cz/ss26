"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  deleteGalleryImageAction,
  getGalleryMediaAction,
  reorderGalleryMediaAction,
  uploadGalleryImageAction,
} from "@/app/admin/gallery-actions";
import { Button } from "@/components/admin/AdminUi";
import { cloudinaryGalleryThumbUrl } from "@/lib/cloudinary-transform";
import type { GalleryMediaItem } from "@/lib/content-blocks";
import { validateImageFile } from "@/lib/validations/media";

type GalleryBlockViewProps = NodeViewProps & {
  articleId: string | null;
};

export function GalleryBlockView({
  node,
  deleteNode,
  selected,
  articleId,
}: GalleryBlockViewProps) {
  const blockId = node.attrs.blockId as string;
  const [items, setItems] = useState<GalleryMediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = useCallback(() => {
    if (!blockId) {
      return;
    }

    startTransition(async () => {
      try {
        const media = await getGalleryMediaAction(blockId);
        setItems(media);
      } catch {
        setError("Galerii se nepodařilo načíst.");
      }
    });
  }, [blockId]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  function handleFilesSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length || !articleId) {
      return;
    }

    setError(null);
    startTransition(async () => {
      for (const file of Array.from(files)) {
        const validationError = validateImageFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadGalleryImageAction(articleId, blockId, formData);
        if ("error" in result && result.error) {
          setError(result.error);
        }
      }

      loadMedia();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  }

  function handleDeleteImage(mediaId: string) {
    startTransition(async () => {
      const result = await deleteGalleryImageAction(mediaId);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      loadMedia();
    });
  }

  function handleDeleteBlock() {
    if (!window.confirm("Opravdu smazat celou galerii včetně fotek?")) {
      return;
    }

    deleteNode();
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      return;
    }

    const current = [...items];
    const fromIndex = current.findIndex((item) => item.id === draggingId);
    const toIndex = current.findIndex((item) => item.id === targetId);
    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const [moved] = current.splice(fromIndex, 1);
    current.splice(toIndex, 0, moved);
    setItems(current);
    setDraggingId(null);

    startTransition(async () => {
      const result = await reorderGalleryMediaAction(
        blockId,
        current.map((item) => item.id),
      );
      if ("error" in result && result.error) {
        setError(result.error);
        loadMedia();
      }
    });
  }

  return (
    <NodeViewWrapper
      className={`my-4 rounded-admin-lg border bg-admin-surface p-4 ${
        selected ? "border-admin-accent ring-2 ring-admin-accent/20" : "border-admin-border"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-admin-text">Galerie</p>
          <p className="text-xs text-admin-muted">
            {items.length}{" "}
            {items.length === 1
              ? "fotka"
              : items.length >= 2 && items.length <= 4
                ? "fotky"
                : "fotek"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!articleId || pending}
            onClick={() => fileInputRef.current?.click()}
          >
            Nahrát fotky
          </Button>
          <Button
            type="button"
            variant="dangerOutline"
            disabled={pending}
            onClick={handleDeleteBlock}
          >
            Smazat galerii
          </Button>
        </div>
      </div>

      {!articleId ? (
        <p className="text-sm text-admin-warning">
          Nejdřív ulož koncept článku, pak můžeš nahrávat fotky.
        </p>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      {error ? (
        <p className="mb-3 text-sm text-admin-danger">{error}</p>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-admin-md border border-dashed border-admin-border px-4 py-8 text-center text-sm text-admin-muted">
          Zatím žádné fotky. Nahraj první obrázky tlačítkem výše.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDraggingId(item.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(item.id)}
              className={`group relative overflow-hidden rounded-admin-md border border-admin-border bg-admin-bg ${
                draggingId === item.id ? "opacity-60" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cloudinaryGalleryThumbUrl(item.url)}
                alt={item.caption ?? "Fotka v galerii"}
                className="aspect-square w-full object-cover"
                draggable={false}
              />
              <button
                type="button"
                aria-label="Odebrat fotku"
                onClick={() => handleDeleteImage(item.id)}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100"
              >
                ×
              </button>
              <span className="absolute bottom-2 left-2 rounded-admin-sm bg-black/55 px-2 py-0.5 text-[10px] text-white">
                táhni
              </span>
            </div>
          ))}
        </div>
      )}
    </NodeViewWrapper>
  );
}
