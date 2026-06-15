export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-graphite-border bg-graphite-surface p-6 shadow-lg shadow-black/20">
      <h1 className="text-2xl font-medium">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm text-graphite-muted">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-graphite-muted">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-graphite-border bg-graphite-bg px-3 py-2 text-graphite-text outline-none transition placeholder:text-graphite-muted focus:border-graphite-accent ${props.className ?? ""}`}
    />
  );
}

export function SubmitButton({
  children,
  pendingText = "Ukládám…",
}: {
  children: React.ReactNode;
  pendingText?: string;
}) {
  return (
    <button
      type="submit"
      className="w-full rounded-md bg-graphite-accent px-4 py-2.5 font-medium text-white transition hover:bg-graphite-accent-hover"
    >
      {children}
    </button>
  );
}

export function FormMessage({ state }: { state?: { error?: string; success?: string } }) {
  if (!state?.error && !state?.success) {
    return null;
  }

  if (state.error) {
    return (
      <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
        {state.error}
      </p>
    );
  }

  return (
    <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
      {state.success}
    </p>
  );
}
