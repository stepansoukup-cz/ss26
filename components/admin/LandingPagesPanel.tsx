"use client";

import { useActionState, useState } from "react";
import { updateLandingPageAction } from "@/app/admin/landing-pages/actions";
import type { ActionState } from "@/app/admin/actions";
import {
  AdminCard,
  inputClassName,
  textareaClassName,
} from "@/components/admin/AdminUi";
import { AutoGrowTextarea } from "@/components/admin/AutoGrowTextarea";
import {
  Field,
  FormMessage,
  SubmitButton,
  TextInput,
} from "@/components/admin/AuthUi";
import type {
  LandingPageContent,
  LandingPageSlug,
} from "@/lib/landing-pages";

const initialState: ActionState = {};

type LandingPagesPanelProps = {
  pages: Array<{
    slug: LandingPageSlug;
    label: string;
    content: LandingPageContent;
  }>;
};

function TextareaField({
  id,
  name,
  label,
  defaultValue,
  rows = 3,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <AutoGrowTextarea
        id={id}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className={`${textareaClassName} block min-h-24 resize-none overflow-hidden py-2.5 leading-relaxed`}
      />
    </Field>
  );
}

function LinesField({
  id,
  name,
  label,
  values,
}: {
  id: string;
  name: string;
  label: string;
  values: string[];
}) {
  return (
    <TextareaField
      id={id}
      name={name}
      label={label}
      defaultValue={values.join("\n")}
      rows={Math.max(3, Math.min(values.length + 1, 8))}
    />
  );
}

function LandingPageForm({
  slug,
  label,
  content,
}: {
  slug: LandingPageSlug;
  label: string;
  content: LandingPageContent;
}) {
  const [state, formAction, pending] = useActionState(
    updateLandingPageAction,
    initialState,
  );

  return (
    <AdminCard
      title={label}
      description="Uprav texty a URL obrázků pro veřejnou landing page. Prázdný obrázek nechá abstraktní ilustraci."
    >
      <form action={formAction} className="space-y-8">
        <input type="hidden" name="slug" value={slug} />

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-faint">
            Hero
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Malý nadpis" htmlFor={`${slug}-hero-eyebrow`}>
              <TextInput
                id={`${slug}-hero-eyebrow`}
                name="hero.eyebrow"
                defaultValue={content.hero.eyebrow}
              />
            </Field>
            <Field label="Primární tlačítko" htmlFor={`${slug}-hero-primary`}>
              <TextInput
                id={`${slug}-hero-primary`}
                name="hero.primaryLabel"
                defaultValue={content.hero.primaryLabel}
              />
            </Field>
          </div>
          <Field label="Hlavní nadpis" htmlFor={`${slug}-hero-title`}>
            <TextInput
              id={`${slug}-hero-title`}
              name="hero.title"
              defaultValue={content.hero.title}
            />
          </Field>
          <TextareaField
            id={`${slug}-hero-text`}
            name="hero.text"
            label="Popis"
            defaultValue={content.hero.text}
          />
          <Field label="Sekundární tlačítko" htmlFor={`${slug}-hero-secondary`}>
            <TextInput
              id={`${slug}-hero-secondary`}
              name="hero.secondaryLabel"
              defaultValue={content.hero.secondaryLabel}
            />
          </Field>
        </section>

        {content.sections.map((section, index) => (
          <section
            key={section.id}
            className="space-y-4 border-t border-admin-border-subtle pt-6"
          >
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-faint">
              Sekce: {section.navLabel}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Malý nadpis" htmlFor={`${slug}-${section.id}-eyebrow`}>
                <TextInput
                  id={`${slug}-${section.id}-eyebrow`}
                  name={`sections.${index}.eyebrow`}
                  defaultValue={section.eyebrow}
                />
              </Field>
              <Field label="URL obrázku" htmlFor={`${slug}-${section.id}-image`}>
                <input
                  id={`${slug}-${section.id}-image`}
                  name={`sections.${index}.imageUrl`}
                  type="url"
                  defaultValue={section.imageUrl ?? ""}
                  placeholder="https://res.cloudinary.com/..."
                  className={inputClassName}
                />
              </Field>
            </div>
            <Field label="Nadpis" htmlFor={`${slug}-${section.id}-title`}>
              <TextInput
                id={`${slug}-${section.id}-title`}
                name={`sections.${index}.title`}
                defaultValue={section.title}
              />
            </Field>
            <TextareaField
              id={`${slug}-${section.id}-text`}
              name={`sections.${index}.text`}
              label="Text"
              defaultValue={section.text}
            />
            <LinesField
              id={`${slug}-${section.id}-bullets`}
              name={`sections.${index}.bullets`}
              label="Štítky / body (každý na nový řádek)"
              values={section.bullets}
            />
          </section>
        ))}

        <section className="space-y-4 border-t border-admin-border-subtle pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-faint">
            Reference / seznam
          </h3>
          <Field label="Malý nadpis" htmlFor={`${slug}-references-eyebrow`}>
            <TextInput
              id={`${slug}-references-eyebrow`}
              name="references.eyebrow"
              defaultValue={content.references.eyebrow}
            />
          </Field>
          <Field label="Nadpis" htmlFor={`${slug}-references-title`}>
            <TextInput
              id={`${slug}-references-title`}
              name="references.title"
              defaultValue={content.references.title}
            />
          </Field>
          <TextareaField
            id={`${slug}-references-text`}
            name="references.text"
            label="Text"
            defaultValue={content.references.text}
          />
          <LinesField
            id={`${slug}-references-items`}
            name="references.items"
            label="Položky (každá na nový řádek)"
            values={content.references.items}
          />
        </section>

        <section className="space-y-4 border-t border-admin-border-subtle pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-admin-faint">
            Závěrečné CTA
          </h3>
          <Field label="Malý nadpis" htmlFor={`${slug}-cta-eyebrow`}>
            <TextInput
              id={`${slug}-cta-eyebrow`}
              name="cta.eyebrow"
              defaultValue={content.cta.eyebrow}
            />
          </Field>
          <Field label="Nadpis" htmlFor={`${slug}-cta-title`}>
            <TextInput
              id={`${slug}-cta-title`}
              name="cta.title"
              defaultValue={content.cta.title}
            />
          </Field>
          <TextareaField
            id={`${slug}-cta-text`}
            name="cta.text"
            label="Text"
            defaultValue={content.cta.text}
          />
          <Field label="Tlačítko" htmlFor={`${slug}-cta-button`}>
            <TextInput
              id={`${slug}-cta-button`}
              name="cta.buttonLabel"
              defaultValue={content.cta.buttonLabel}
            />
          </Field>
        </section>

        <FormMessage state={state} />
        <SubmitButton className="w-auto px-6">
          {pending ? "Ukládám…" : "Uložit landing page"}
        </SubmitButton>
      </form>
    </AdminCard>
  );
}

export function LandingPagesPanel({ pages }: LandingPagesPanelProps) {
  const [activeSlug, setActiveSlug] = useState<LandingPageSlug>(
    pages[0]?.slug ?? "webove-aplikace",
  );
  const activePage = pages.find((page) => page.slug === activeSlug) ?? pages[0];

  if (!activePage) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-admin-lg border border-admin-border bg-admin-surface p-1.5">
        <div
          role="tablist"
          aria-label="Výběr landing page"
          className="flex flex-wrap gap-1.5"
        >
          {pages.map((page) => {
            const active = page.slug === activeSlug;
            return (
              <button
                key={page.slug}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`landing-page-panel-${page.slug}`}
                onClick={() => setActiveSlug(page.slug)}
                className={`rounded-admin-md px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30 ${
                  active
                    ? "bg-admin-accent-muted text-admin-accent"
                    : "text-admin-muted hover:bg-admin-surface-muted hover:text-admin-text"
                }`}
              >
                {page.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`landing-page-panel-${activePage.slug}`}
        role="tabpanel"
        aria-label={activePage.label}
      >
        <LandingPageForm key={activePage.slug} {...activePage} />
      </div>
    </div>
  );
}
