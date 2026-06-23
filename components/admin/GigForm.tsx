"use client";

import { useActionState, useMemo, useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { deleteGigAction, saveGigAction } from "@/app/admin/koncerty/actions";
import { Field, FormMessage, SubmitButton, TextInput, textareaClassName } from "@/components/admin/AuthUi";
import { AdminCard, Button, selectClassName } from "@/components/admin/AdminUi";
import { AutoGrowTextarea } from "@/components/admin/AutoGrowTextarea";

const initialState: ActionState = {};

type BandOption = { id: string; name: string };
type GearOption = {
  id: string;
  label: string;
  category: string;
  boughtAt: string | null;
  soldAt: string | null;
  childCount: number;
};

export type GigFormDefaults = {
  id?: string;
  date: string;
  city: string;
  place: string;
  name: string;
  bandId: string;
  note: string;
  photosUrl: string;
  recordingUrl: string;
  youtubeUrl: string;
  gearIds: string[];
};

function availableForDate(gear: GearOption, dateValue: string) {
  if (!dateValue) return true;
  const time = new Date(dateValue).getTime();
  if (gear.boughtAt && new Date(gear.boughtAt).getTime() > time) return false;
  if (gear.soldAt && new Date(gear.soldAt).getTime() < time) return false;
  return true;
}

export function GigForm({
  defaults,
  bands,
  gearOptions,
  saved = false,
}: {
  defaults: GigFormDefaults;
  bands: BandOption[];
  gearOptions: GearOption[];
  saved?: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveGigAction, initialState);
  const [bandId, setBandId] = useState(defaults.bandId);
  const [dateValue, setDateValue] = useState(defaults.date);
  const visibleGear = useMemo(
    () => gearOptions.filter((gear) => availableForDate(gear, dateValue)),
    [gearOptions, dateValue],
  );

  return (
    <div className="space-y-6">
      {saved ? (
        <div className="rounded-admin-lg border border-admin-success-border bg-admin-success-muted px-admin-4 py-admin-3 text-admin-success">
          Koncert byl uložen.
        </div>
      ) : null}
      <form action={formAction} className="space-y-6">
        {defaults.id ? <input type="hidden" name="id" value={defaults.id} /> : null}
        <AdminCard title="Koncert">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Datum" htmlFor="date">
              <TextInput id="date" name="date" type="date" value={dateValue} onChange={(event) => setDateValue(event.target.value)} required />
            </Field>
            <Field label="Kapela" htmlFor="bandId">
              <select id="bandId" name="bandId" value={bandId} onChange={(event) => setBandId(event.target.value)} className={selectClassName} required>
                <option value="">Vyber kapelu</option>
                {bands.map((band) => (
                  <option key={band.id} value={band.id}>{band.name}</option>
                ))}
                <option value="__new">+ nová kapela</option>
              </select>
            </Field>
          </div>
          {bandId === "__new" ? (
            <Field label="Název nové kapely" htmlFor="newBandName">
              <TextInput id="newBandName" name="newBandName" />
            </Field>
          ) : null}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Město" htmlFor="city">
              <TextInput id="city" name="city" defaultValue={defaults.city} required />
            </Field>
            <Field label="Místo" htmlFor="place">
              <TextInput id="place" name="place" defaultValue={defaults.place} />
            </Field>
          </div>
          <Field label="Název akce / festival" htmlFor="name">
            <TextInput id="name" name="name" defaultValue={defaults.name} />
          </Field>
          <Field label="Poznámka" htmlFor="note">
            <AutoGrowTextarea id="note" name="note" defaultValue={defaults.note} rows={4} className={`${textareaClassName} block min-h-24 resize-none overflow-hidden py-2.5 leading-relaxed`} />
          </Field>
        </AdminCard>

        <AdminCard title="Odkazy">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Fotky URL" htmlFor="photosUrl">
              <TextInput id="photosUrl" name="photosUrl" type="url" defaultValue={defaults.photosUrl} />
            </Field>
            <Field label="Záznam MP3 URL" htmlFor="recordingUrl">
              <TextInput id="recordingUrl" name="recordingUrl" type="url" defaultValue={defaults.recordingUrl} />
            </Field>
            <Field label="YouTube URL" htmlFor="youtubeUrl">
              <TextInput id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={defaults.youtubeUrl} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Použitý gear" description="Zobrazují se jen samostatné kusy a kontejnery. Zaškrtnutý kontejner se při uložení rozbalí i na svůj aktuální obsah.">
          <div className="grid gap-2 sm:grid-cols-2">
            {visibleGear.map((gear) => (
              <label key={gear.id} className="flex items-center gap-3 rounded-admin-md border border-admin-border bg-admin-bg px-3 py-2 text-sm text-admin-text">
                <input type="checkbox" name="gearIds" value={gear.id} defaultChecked={defaults.gearIds.includes(gear.id)} />
                <span>
                  <span className="font-medium">{gear.label}</span>
                  <span className="block text-xs text-admin-muted">
                    {gear.category}{gear.childCount ? ` · obsah: ${gear.childCount}` : ""}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </AdminCard>

        <FormMessage state={state} />
        <SubmitButton className="w-auto px-6">{pending ? "Ukládám…" : "Uložit koncert"}</SubmitButton>
      </form>
      {defaults.id ? (
        <AdminCard title="Smazání">
          <form action={deleteGigAction}>
            <input type="hidden" name="id" value={defaults.id} />
            <Button
              type="submit"
              variant="dangerOutline"
              onClick={(event) => {
                if (!window.confirm("Opravdu smazat koncert?")) event.preventDefault();
              }}
            >
              Smazat koncert
            </Button>
          </form>
        </AdminCard>
      ) : null}
    </div>
  );
}
