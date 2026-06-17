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
import { AdminCard } from "@/components/admin/AdminUi";
import { MAX_IMAGE_UPLOAD_MB } from "@/lib/image-upload";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";

const initialState: ActionState = {};

type SiteSettingsData = {
  siteName: string;
  logoUrl: string | null;
};

export function SiteSettingsPanel({ settings }: { settings: SiteSettingsData }) {
  return (
    <div className="space-y-6">
      <AdminCard
        title="Název webu"
        description="Zobrazí se v hlavičce a v titulku stránky (až přidáme veřejný web)."
      >
        <SiteNameForm siteName={settings.siteName} />
      </AdminCard>

      <AdminCard title="Logo webu">
        <ImageUploadForm
          action={uploadSiteLogoAction}
          currentUrl={settings.logoUrl}
          label="Logo webu"
          description={`Doporučený formát PNG nebo SVG exportované jako PNG. Max. ${MAX_IMAGE_UPLOAD_MB} MB — server obrázek před nahráním zmenší a optimalizuje.`}
          alt="Logo webu"
          previewClassName="max-h-24 max-w-full object-contain"
          submitLabel="Nahrát logo"
          removeAction={removeSiteLogoFormAction}
          removeLabel="Odstranit logo"
        />
      </AdminCard>
    </div>
  );
}

function SiteNameForm({ siteName }: { siteName: string }) {
  const [state, formAction, pending] = useActionState(
    updateSiteNameAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
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
      <SubmitButton className="w-auto px-6">
        {pending ? "Ukládám…" : "Uložit název"}
      </SubmitButton>
    </form>
  );
}
