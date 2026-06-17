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
import { AdminCard } from "@/components/admin/AdminUi";
import { ImageUploadForm } from "@/components/admin/ImageUploadForm";
import { MAX_IMAGE_UPLOAD_MB } from "@/lib/image-upload";

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
    <div className="space-y-6">
      <AdminCard
        title="Avatar"
        description={`Tvoje profilová fotka v administraci. Max. ${MAX_IMAGE_UPLOAD_MB} MB — server obrázek před nahráním zmenší a optimalizuje.`}
      >
        <ImageUploadForm
          action={uploadAvatarAction}
          currentUrl={user.avatarUrl}
          label="Avatar"
          alt={`Avatar uživatele ${user.firstName}`}
          submitLabel="Nahrát avatar"
          removeAction={removeAvatarFormAction}
          removeLabel="Odstranit avatar"
        />
      </AdminCard>

      <AdminCard
        title="Osobní údaje"
        description="Uživatelské jméno je vždy tvůj e-mail — nelze měnit."
      >
        <ProfileForm user={user} />
      </AdminCard>

      <AdminCard
        title="Změna hesla"
        description="Pokud ses přihlásil/a kódem z e-mailu, heslo zůstává beze změny, dokud ho tady sám/sama nezměníš."
      >
        <PasswordForm />
      </AdminCard>

      <AdminCard title="Účet">
        <dl className="grid gap-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-admin-muted">E-mail (uživatelské jméno)</dt>
            <dd className="mt-1 font-medium text-admin-text">{user.email}</dd>
          </div>
          <div>
            <dt className="text-admin-muted">Role</dt>
            <dd className="mt-1 font-medium text-admin-text">{user.role}</dd>
          </div>
        </dl>
      </AdminCard>
    </div>
  );
}

function ProfileForm({ user }: { user: ProfileUser }) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
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
      <SubmitButton className="w-auto px-6">
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
    <form action={formAction} className="space-y-5">
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
      <SubmitButton className="w-auto px-6">
        {pending ? "Měním heslo…" : "Změnit heslo"}
      </SubmitButton>
    </form>
  );
}
