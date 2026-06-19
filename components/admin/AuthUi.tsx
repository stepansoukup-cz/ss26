import {
  Alert,
  inputClassName,
  textareaClassName,
} from "@/components/admin/AdminUi";

export function AuthCard({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full rounded-admin-xl border border-admin-border bg-admin-surface p-6 shadow-admin-md sm:p-8">
      {title ? (
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      ) : null}
      {description ? (
        <p className={`text-sm text-admin-muted${title ? " mt-2" : ""}`}>
          {description}
        </p>
      ) : null}
      <div className={title || description ? "mt-6" : ""}>{children}</div>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  /**
   * Id přidruženého ovládacího prvku. Záměrně NEobalujeme children do <label>,
   * protože <label> bez htmlFor přeposílá kliknutí na svůj první formulářový
   * prvek — u složených widgetů (editor s toolbarem) by klik kamkoliv spustil
   * první tlačítko (např. H2).
   */
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block space-y-2 text-sm">
      <label
        htmlFor={htmlFor}
        className="block font-medium text-admin-text"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={`${inputClassName} ${props.className ?? ""}`}
    />
  );
}

export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={`w-full rounded-admin-md bg-admin-accent px-4 py-2.5 text-sm font-medium text-white shadow-admin-sm transition hover:bg-admin-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function FormMessage({
  state,
}: {
  state?: { error?: string; success?: string };
}) {
  if (!state?.error && !state?.success) {
    return null;
  }

  if (state.error) {
    return <Alert variant="error">{state.error}</Alert>;
  }

  return <Alert variant="success">{state.success}</Alert>;
}

export { textareaClassName };
