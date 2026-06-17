"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestLoginCodeAction,
  type ActionState,
} from "@/app/admin/actions";
import {
  AuthCard,
  Field,
  FormMessage,
  SubmitButton,
  TextInput,
} from "@/components/admin/AuthUi";

const initialState: ActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestLoginCodeAction,
    initialState,
  );

  return (
    <AuthCard description="Pošleme ti jednorázový kód. Přihlásíš se jím bez změny hesla — původní heslo zůstane platné.">
      <form action={formAction} className="space-y-4">
        <Field label="E-mail účtu">
          <TextInput
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
        </Field>
        <FormMessage state={state} />
        <SubmitButton pendingText="Odesílám…">
          {pending ? "Odesílám…" : "Poslat přihlašovací kód"}
        </SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-admin-muted">
        <Link
          href="/admin/prihlaseni"
          className="text-admin-accent transition hover:text-admin-accent-hover"
        >
          Zpět na přihlášení
        </Link>
      </p>
    </AuthCard>
  );
}
