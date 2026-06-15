"use client";

import { useActionState } from "react";
import {
  updateSiteNameAction,
  uploadSiteLogoAction,
  removeSiteLogoFormAction,
} from "@/app/admin/media-actions";
import type { ActionState } from "@/app/admin/actions";
import {
  Field,
  FormMessage,
  SubmitButton,
  TextInput,
} from "@/components/admin/AuthUi";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";

const initialState: ActionState = {};

type SiteSettingsData = {
  siteName: string;
  logoUrl: string | null;
};

export function SiteSettingsPanel({ settings }: { settings: SiteSettingsData }) {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-graphite-border bg-graphite-surface p-6">
        <h2 className="text-lg font-medium">Název webu</h2>
        <p className="mt-1 text-sm text-graphite-muted">
          Zobrazí se v hlavičce a v titulku stránky (až přidáme veřejný web).
        </p>
        <SiteNameForm siteName={settings.siteName} />
      </section>

      <section className="rounded-xl border border-graphite-border bg-graphite-surface p-6">
        <ImageUploadForm
          action={uploadSiteLogoAction}
          currentUrl={settings.logoUrl}
          label="Logo webu"
          description="Doporučený formát PNG nebo SVG exportované jako PNG. Max. 4 MB."
          alt="Logo webu"
          previewClassName="max-h-24 max-w-full object-contain"
          submitLabel="Nahrát logo"
          removeAction={removeSiteLogoFormAction}
          removeLabel="Odstranit logo"
        />
      </section>
    </div>
  );
}

function SiteNameForm({ siteName }: { siteName: string }) {
  const [state, formAction, pending] = useActionState(
    updateSiteNameAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <Field label="Název webu">
        <TextInput
          id="siteName"
          name="siteName"
          defaultValue={siteName}
          required
          maxLength={120}
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="Ukládám…">
        {pending ? "Ukládám…" : "Uložit název"}
      </SubmitButton>
    </form>
  );
}
