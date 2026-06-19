"use client";

import { useActionState } from "react";
import {
  updateSiteNameAction,
  updateSiteSocialsAction,
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
  facebookUrl: string | null;
  instagramUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  contactEmail: string | null;
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

      <AdminCard
        title="Sociální profily a kontakt"
        description="Ukládej kompletní URL profilů. Front page je později použije pro odkazy v patičce nebo hlavičce."
      >
        <SiteSocialsForm settings={settings} />
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
      <Field label="Název webu" htmlFor="siteName">
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

function SiteSocialsForm({ settings }: { settings: SiteSettingsData }) {
  const [state, formAction, pending] = useActionState(
    updateSiteSocialsAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Facebook" htmlFor="facebookUrl">
          <TextInput
            id="facebookUrl"
            name="facebookUrl"
            type="url"
            defaultValue={settings.facebookUrl ?? ""}
            placeholder="https://www.facebook.com/..."
          />
        </Field>
        <Field label="Instagram" htmlFor="instagramUrl">
          <TextInput
            id="instagramUrl"
            name="instagramUrl"
            type="url"
            defaultValue={settings.instagramUrl ?? ""}
            placeholder="https://www.instagram.com/..."
          />
        </Field>
        <Field label="Spotify" htmlFor="spotifyUrl">
          <TextInput
            id="spotifyUrl"
            name="spotifyUrl"
            type="url"
            defaultValue={settings.spotifyUrl ?? ""}
            placeholder="https://open.spotify.com/..."
          />
        </Field>
        <Field label="YouTube" htmlFor="youtubeUrl">
          <TextInput
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            defaultValue={settings.youtubeUrl ?? ""}
            placeholder="https://www.youtube.com/..."
          />
        </Field>
        <Field label="TikTok" htmlFor="tiktokUrl">
          <TextInput
            id="tiktokUrl"
            name="tiktokUrl"
            type="url"
            defaultValue={settings.tiktokUrl ?? ""}
            placeholder="https://www.tiktok.com/@..."
          />
        </Field>
        <Field label="E-mail" htmlFor="contactEmail">
          <TextInput
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail ?? ""}
            placeholder="mail@example.com"
          />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton className="w-auto px-6">
        {pending ? "Ukládám…" : "Uložit odkazy"}
      </SubmitButton>
    </form>
  );
}
