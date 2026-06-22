"use client";

import { useActionState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { FormMessage } from "@/components/admin/AuthUi";
import { Button, fileInputClassName } from "@/components/admin/AdminUi";

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
    <div className="space-y-5">
      {description ? (
        <p className="text-sm text-admin-muted">{description}</p>
      ) : null}

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-admin-lg border border-dashed border-admin-border bg-admin-bg">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUrl}
              alt={alt}
              className={previewClassName}
            />
          ) : (
            <span className="px-2 text-center text-xs text-admin-faint">
              Zatím žádný obrázek
            </span>
          )}
        </div>

        <form action={formAction} className="min-w-[220px] flex-1 space-y-3">
          <p className="text-sm font-medium text-admin-text">{label}</p>
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
            required={!currentUrl}
            className={fileInputClassName}
          />
          <FormMessage state={state} />
          <Button type="submit" disabled={pending}>
            {pending ? "Nahrávám…" : submitLabel}
          </Button>
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
      <Button type="submit" variant="dangerOutline" disabled={pending}>
        {pending ? "Odstraňuji…" : label}
      </Button>
      <FormMessage state={state} />
    </form>
  );
}
