"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { FormMessage } from "@/components/admin/AuthUi";

const initialState: ActionState = {};

type ImageUploadFormProps = {
  action: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  currentUrl?: string | null;
  label: string;
  description?: string;
  alt: string;
  previewClassName?: string;
  submitLabel?: string;
  removeAction?: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  removeLabel?: string;
};

export function ImageUploadForm({
  action,
  currentUrl,
  label,
  description,
  alt,
  previewClassName = "h-24 w-24 rounded-full object-cover",
  submitLabel = "Nahrát obrázek",
  removeAction,
  removeLabel = "Odstranit obrázek",
}: ImageUploadFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">{label}</h3>
        {description ? (
          <p className="mt-1 text-sm text-graphite-muted">{description}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-xl border border-dashed border-graphite-border bg-graphite-bg">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt={alt}
              className={previewClassName}
            />
          ) : (
            <span className="px-2 text-center text-xs text-graphite-muted">
              Zatím žádný obrázek
            </span>
          )}
        </div>

        <form action={formAction} className="min-w-[220px] flex-1 space-y-3">
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required={!currentUrl}
            className="block w-full text-sm text-graphite-muted file:mr-3 file:rounded-md file:border-0 file:bg-graphite-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-graphite-accent-hover"
          />
          <FormMessage state={state} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-graphite-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-graphite-accent-hover disabled:opacity-60"
          >
            {pending ? "Nahrávám…" : submitLabel}
          </button>
        </form>
      </div>

      {currentUrl && removeAction ? (
        <RemoveImageButton action={removeAction} label={removeLabel} />
      ) : null}
    </div>
  );
}

function RemoveImageButton({
  action,
  label,
}: {
  action: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-graphite-border px-3 py-1.5 text-sm text-graphite-muted transition hover:border-red-400/50 hover:text-red-300 disabled:opacity-60"
      >
        {pending ? "Odstraňuji…" : label}
      </button>
      <FormMessage state={state} />
    </form>
  );
}
