"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  deleteAudioTrackAction,
  getAudioMediaAction,
  reorderAudioMediaAction,
  updateAudioTrackCaptionAction,
  uploadAudioTrackAction,
} from "@/app/admin/audio-actions";
import { Button, inputClassName } from "@/components/admin/AdminUi";
import { audioUploadHint } from "@/lib/audio-upload";
import type { AudioMediaItem } from "@/lib/content-block-constants";
import { validateAudioFile } from "@/lib/validations/audio";

type AudioPlayerBlockViewProps = NodeViewProps & {
  articleId: string | null;
};

function trackLabel(track: AudioMediaItem, index: number) {
  return track.caption?.trim() || `Stopa ${index + 1}`;
}

export function AudioPlayerBlockView({
  node,
  deleteNode,
  selected,
  articleId,
}: AudioPlayerBlockViewProps) {
  const blockId = node.attrs.blockId as string;
  const [items, setItems] = useState<AudioMediaItem[]>([]);
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
        const media = await getAudioMediaAction(blockId);
        setItems(media);
      } catch {
        setError("Přehrávač se nepodařilo načíst.");
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
        const validationError = validateAudioFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadAudioTrackAction(articleId, blockId, formData);
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

  function handleDeleteTrack(mediaId: string) {
    startTransition(async () => {
      const result = await deleteAudioTrackAction(mediaId);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      loadMedia();
    });
  }

  function handleCaptionBlur(mediaId: string, value: string) {
    startTransition(async () => {
      const result = await updateAudioTrackCaptionAction(mediaId, value);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if ("media" in result && result.media) {
        setItems((current) =>
          current.map((item) =>
            item.id === mediaId ? { ...item, caption: result.media.caption } : item,
          ),
        );
      }
    });
  }

  function handleDeleteBlock() {
    if (!window.confirm("Opravdu smazat celý přehrávač včetně audio souborů?")) {
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
      const result = await reorderAudioMediaAction(
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
          <p className="text-sm font-medium text-admin-text">Přehrávač</p>
          <p className="text-xs text-admin-muted">
            {items.length}{" "}
            {items.length === 1
              ? "stopa"
              : items.length >= 2 && items.length <= 4
                ? "stopy"
                : "stop"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!articleId || pending}
            onClick={() => fileInputRef.current?.click()}
          >
            Nahrát audio
          </Button>
          <Button
            type="button"
            variant="dangerOutline"
            disabled={pending}
            onClick={handleDeleteBlock}
          >
            Smazat přehrávač
          </Button>
        </div>
      </div>

      {!articleId ? (
        <p className="text-sm text-admin-warning">
          Nejdřív ulož koncept článku, pak můžeš nahrávat audio.
        </p>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,.mp3,.wav"
        multiple
        className="hidden"
        onChange={handleFilesSelected}
      />

      <p className="mb-3 text-xs text-admin-faint">{audioUploadHint()}</p>

      {error ? (
        <p className="mb-3 text-sm text-admin-danger">{error}</p>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-admin-md border border-dashed border-admin-border px-4 py-8 text-center text-sm text-admin-muted">
          Zatím žádné stopy. Nahraj MP3 nebo WAV tlačítkem výše.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDraggingId(item.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(item.id)}
              className={`rounded-admin-md border border-admin-border bg-admin-bg p-3 ${
                draggingId === item.id ? "opacity-60" : ""
              }`}
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <label className="block text-xs font-medium text-admin-muted">
                    Název stopy
                    <input
                      type="text"
                      defaultValue={item.caption ?? ""}
                      placeholder={trackLabel(item, index)}
                      className={`${inputClassName} mt-1`}
                      onBlur={(event) =>
                        handleCaptionBlur(item.id, event.target.value)
                      }
                    />
                  </label>
                  <p className="text-xs text-admin-faint">Táhni řádek pro změnu pořadí</p>
                </div>
                <button
                  type="button"
                  aria-label="Odebrat stopu"
                  onClick={() => handleDeleteTrack(item.id)}
                  className="rounded-admin-md px-2 py-1 text-xs text-admin-danger transition hover:bg-admin-danger-muted"
                >
                  Smazat
                </button>
              </div>
              <audio
                controls
                preload="metadata"
                src={item.url}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}
    </NodeViewWrapper>
  );
}
