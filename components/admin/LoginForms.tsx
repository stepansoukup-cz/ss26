"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  loginWithCodeAction,
  loginWithPasswordAction,
  type ActionState,
} from "@/app/admin/actions";
import {
  AuthCard,
  Field,
  FormMessage,
  SubmitButton,
  TextInput,
} from "@/components/admin/AuthUi";
import { useLoginRedirect } from "@/components/admin/useLoginRedirect";

const initialState: ActionState = {};

export function LoginForms({ nextPath }: { nextPath?: string }) {
  return (
    <AuthCard
      title="Přihlášení"
      description="Přihlas se e-mailem a heslem, nebo jednorázovým kódem z e-mailu."
    >
      <div className="space-y-8">
        <PasswordLoginForm nextPath={nextPath} />
        <div className="border-t border-graphite-border pt-8">
          <CodeLoginForm nextPath={nextPath} />
        </div>
        <p className="text-center text-sm text-graphite-muted">
          <Link
            href="/admin/zapomenute-heslo"
            className="text-graphite-accent transition hover:text-graphite-accent-hover"
          >
            Zapomněl/a jsem heslo — poslat kód
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}

function PasswordLoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction, pending] = useActionState(
    loginWithPasswordAction,
    initialState,
  );
  useLoginRedirect(state);

  return (
    <form action={formAction} className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-graphite-muted">
        E-mail a heslo
      </h2>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <Field label="E-mail (uživatelské jméno)">
        <TextInput
          id="password-login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </Field>
      <Field label="Heslo">
        <TextInput
          id="password-login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="Přihlašuji…">
        {pending ? "Přihlašuji…" : "Přihlásit se"}
      </SubmitButton>
    </form>
  );
}

function CodeLoginForm({ nextPath }: { nextPath?: string }) {
  const [state, formAction, pending] = useActionState(
    loginWithCodeAction,
    initialState,
  );
  useLoginRedirect(state);

  return (
    <form action={formAction} className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-graphite-muted">
        Přihlášení kódem
      </h2>
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      <Field label="E-mail">
        <TextInput
          id="code-login-email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </Field>
      <Field label="6místný kód z e-mailu">
        <TextInput
          id="code-login-code"
          name="code"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          autoComplete="one-time-code"
          placeholder="123456"
          required
        />
      </Field>
      <FormMessage state={state} />
      <SubmitButton pendingText="Ověřuji kód…">
        {pending ? "Ověřuji kód…" : "Přihlásit se kódem"}
      </SubmitButton>
    </form>
  );
}
