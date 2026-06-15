"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  updateProfileAction,
  type ActionState,
} from "@/app/admin/actions";
import {
  uploadAvatarAction,
  removeAvatarFormAction,
} from "@/app/admin/media-actions";
import {
  Field,
  FormMessage,
  SubmitButton,
  TextInput,
} from "@/components/admin/AuthUi";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";

const initialState: ActionState = {};

type ProfileUser = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl: string | null;
};

export function ProfileSettings({ user }: { user: ProfileUser }) {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-graphite-border bg-graphite-surface p-6">
        <ImageUploadForm
          action={uploadAvatarAction}
          currentUrl={user.avatarUrl}
          label="Avatar"
          description="Tvoje profilová fotka v administraci. Max. 4 MB."
          alt={`Avatar uživatele ${user.firstName}`}
          submitLabel="Nahrát avatar"
          removeAction={removeAvatarFormAction}
          removeLabel="Odstranit avatar"
        />
      </section>

      <section className="rounded-xl border border-graphite-border bg-graphite-surface p-6">
        <h2 className="text-lg font-medium">Osobní údaje</h2>
        <p className="mt-1 text-sm text-graphite-muted">
          Uživatelské jméno je vždy tvůj e-mail — nelze měnit.
        </p>
        <ProfileForm user={user} />
      </section>

      <section className="rounded-xl border border-graphite-border bg-graphite-surface p-6">
        <h2 className="text-lg font-medium">Změna hesla</h2>
        <p className="mt-1 text-sm text-graphite-muted">
          Pokud ses přihlásil/a kódem z e-mailu, heslo zůstává beze změny, dokud
          ho tady sám/ sama nezměníš.
        </p>
        <PasswordForm />
      </section>

      <dl className="grid gap-3 rounded-xl border border-graphite-border bg-graphite-surface p-6 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-graphite-muted">E-mail (uživatelské jméno)</dt>
          <dd className="mt-1 font-medium">{user.email}</dd>
        </div>
        <div>
          <dt className="text-graphite-muted">Role</dt>
          <dd className="mt-1 font-medium">{user.role}</dd>
        </div>
      </dl>
    </div>
  );
}

function ProfileForm({ user }: { user: ProfileUser }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Jméno">
          <TextInput
            id="firstName"
            name="firstName"
            defaultValue={user.firstName}
            required
          />
        </Field>
        <Field label="Příjmení">
          <TextInput
            id="lastName"
            name="lastName"
            defaultValue={user.lastName}
          />
        </Field>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Ukládám…">
        {pending ? "Ukládám…" : "Uložit profil"}
      </SubmitButton>
    </form>
  );
}

function PasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <Field label="Současné heslo">
        <TextInput
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <Field label="Nové heslo">
        <TextInput
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <Field label="Nové heslo znovu">
        <TextInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="Měním heslo…">
        {pending ? "Měním heslo…" : "Změnit heslo"}
      </SubmitButton>
    </form>
  );
}
