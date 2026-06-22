"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  confirmPasswordChangeAction,
  revokeOtherSessionsAction,
  revokeSessionAction,
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
import { Badge, Button } from "@/components/admin/AdminUi";
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

type UserSession = {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastSeenAt: string;
};

export function ProfileSettings({
  user,
  sessions,
  currentSessionId,
}: {
  user: ProfileUser;
  sessions: UserSession[];
  currentSessionId: string | null;
}) {
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

      <AdminCard
        title="Přihlášená zařízení"
        description="Aktivní relace přihlášené k tomuto administrátorskému účtu."
      >
        <SessionsList
          sessions={sessions}
          currentSessionId={currentSessionId}
        />
      </AdminCard>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDevice(userAgent: string | null) {
  if (!userAgent) {
    return "Neznámé zařízení";
  }

  const browser = userAgent.includes("Edg/")
    ? "Edge"
    : userAgent.includes("OPR/")
      ? "Opera"
      : userAgent.includes("Firefox/")
        ? "Firefox"
        : userAgent.includes("Chrome/")
          ? "Chrome"
          : userAgent.includes("Safari/")
            ? "Safari"
            : "Prohlížeč";

  const system = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac OS X")
      ? "macOS"
      : userAgent.includes("Android")
        ? "Android"
        : userAgent.includes("iPhone") || userAgent.includes("iPad")
          ? "iOS"
          : userAgent.includes("Linux")
            ? "Linux"
            : "neznámém systému";

  return `${browser} na ${system}`;
}

function SessionsList({
  sessions,
  currentSessionId,
}: {
  sessions: UserSession[];
  currentSessionId: string | null;
}) {
  const otherSessionsCount = sessions.filter(
    (session) => session.id !== currentSessionId,
  ).length;

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-admin-muted">
        Zatím tu není žádná aktivní relace.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {otherSessionsCount > 0 ? (
        <form
          action={revokeOtherSessionsAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                "Opravdu odhlásit všechna ostatní zařízení? Na tomto zařízení zůstaneš přihlášený.",
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <Button type="submit" variant="dangerOutline">
            Odhlásit všechna ostatní zařízení
          </Button>
        </form>
      ) : null}

      <div className="divide-y divide-admin-border-subtle rounded-admin-lg border border-admin-border">
        {sessions.map((session) => {
          const current = session.id === currentSessionId;

          return (
            <div
              key={session.id}
              className="grid gap-4 p-admin-4 lg:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-admin-text">
                    {formatDevice(session.userAgent)}
                  </h3>
                  {current ? <Badge variant="published">Toto zařízení</Badge> : null}
                </div>

                <dl className="grid gap-3 text-sm text-admin-muted sm:grid-cols-3">
                  <div>
                    <dt className="text-admin-faint">IP adresa</dt>
                    <dd className="mt-1 text-admin-text">
                      {session.ip ?? "Neznámá"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-admin-faint">Vytvořeno</dt>
                    <dd className="mt-1 text-admin-text">
                      {formatDateTime(session.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-admin-faint">Naposledy aktivní</dt>
                    <dd className="mt-1 text-admin-text">
                      {formatDateTime(session.lastSeenAt)}
                    </dd>
                  </div>
                </dl>
              </div>

              {current ? null : (
                <form
                  action={revokeSessionAction}
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        "Opravdu odhlásit toto zařízení?",
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                  className="flex items-start lg:justify-end"
                >
                  <input type="hidden" name="sessionId" value={session.id} />
                  <Button type="submit" variant="dangerOutline">
                    Odhlásit
                  </Button>
                </form>
              )}
            </div>
          );
        })}
      </div>
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
  const [requestState, requestAction, requestPending] = useActionState(
    changePasswordAction,
    initialState,
  );
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmPasswordChangeAction,
    initialState,
  );
  const showCodeForm =
    requestState.passwordChangeCodeSent ||
    confirmState.passwordChangeCodeSent;

  return (
    <div className="space-y-6">
      <form action={requestAction} className="space-y-5">
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
            minLength={12}
            required
          />
        </Field>
        <Field label="Nové heslo znovu">
          <TextInput
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
          />
        </Field>
        <FormMessage state={requestState} />
        <SubmitButton className="w-auto px-6">
          {requestPending ? "Ověřuji a posílám kód…" : "Poslat potvrzovací kód"}
        </SubmitButton>
      </form>

      {showCodeForm ? (
        <form
          action={confirmAction}
          className="space-y-5 rounded-admin-lg border border-admin-border bg-admin-bg p-admin-5"
        >
          <div>
            <h3 className="font-medium text-admin-text">Potvrzení změny hesla</h3>
            <p className="mt-1 text-sm text-admin-muted">
              Opiš 6místný kód poslaný na registrovaný e-mail. Teprve potom se heslo změní.
            </p>
          </div>
          <Field label="Potvrzovací kód">
            <TextInput
              id="passwordChangeCode"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
          </Field>
          <FormMessage state={confirmState} />
          <SubmitButton className="w-auto px-6">
            {confirmPending ? "Ověřuji kód…" : "Potvrdit změnu hesla"}
          </SubmitButton>
        </form>
      ) : null}
    </div>
  );
}
