"use client";

import { useActionState } from "react";
import {
  sendContactFormAction,
  type ContactFormState,
} from "@/app/kontakt/actions";
import { CONTACT_SUBJECTS } from "@/lib/validations/contact";

const initialState: ContactFormState = {};

const fieldClassName =
  "w-full rounded-xl border border-graphite-border bg-graphite-surface px-4 py-3 text-sm text-graphite-text outline-none transition placeholder:text-graphite-muted focus:border-graphite-accent focus:ring-2 focus:ring-graphite-accent/20";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm text-graphite-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactFormAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Jméno" htmlFor="contact-name">
          <input
            id="contact-name"
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            className={fieldClassName}
          />
        </Field>
        <Field label="E-mail" htmlFor="contact-email">
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClassName}
          />
        </Field>
      </div>

      <Field label="Čeho se zpráva týká" htmlFor="contact-subject">
        <select
          id="contact-subject"
          name="subject"
          required
          defaultValue={CONTACT_SUBJECTS[0]}
          className={fieldClassName}
        >
          {CONTACT_SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Dotaz" htmlFor="contact-message">
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={8}
          className={`${fieldClassName} resize-y leading-7`}
          placeholder="Napiš, co potřebuješ probrat. Přílohy se tímto formulářem neposílají."
        />
      </Field>

      <Field
        label="Antispam: sečti číslo dne a měsíce dnešního data"
        htmlFor="contact-antispam"
      >
        <input
          id="contact-antispam"
          name="antiSpamAnswer"
          type="number"
          inputMode="numeric"
          required
          step={1}
          className={fieldClassName}
        />
      </Field>

      {state.error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-graphite-accent px-6 py-3 text-sm font-medium text-white transition hover:bg-graphite-accent-hover disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Odesílám…" : "Odeslat zprávu"}
      </button>
    </form>
  );
}
