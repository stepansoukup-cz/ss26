"use client";

import { useEffect, type ReactNode } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const buttonBase =
  "inline-flex h-9 items-center justify-center gap-admin-2 rounded-admin-md px-admin-4 text-admin-body font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/20 disabled:pointer-events-none disabled:opacity-50";

const buttonVariants = {
  primary: `${buttonBase} bg-admin-primary text-admin-primary-foreground hover:bg-admin-primary-hover`,
  secondary: `${buttonBase} border border-admin-border bg-admin-surface text-admin-text hover:bg-admin-surface-muted`,
  ghost: `${buttonBase} text-admin-muted hover:bg-admin-surface-muted hover:text-admin-text`,
  danger: `${buttonBase} bg-admin-danger text-white hover:bg-admin-danger/90`,
  dangerOutline: `${buttonBase} border border-admin-danger-border bg-admin-danger-muted text-admin-danger hover:bg-admin-danger-muted/80`,
} as const;

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
}) {
  return (
    <button
      {...props}
      className={cx(buttonVariants[variant], className)}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: keyof typeof buttonVariants;
}) {
  return (
    <a
      {...props}
      className={cx(buttonVariants[variant], className)}
    />
  );
}

export function AdminCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-admin-lg border border-admin-border bg-admin-surface",
        className,
      )}
    >
      {title ? (
        <div className="border-b border-admin-border-subtle px-admin-6 py-admin-5">
          <h2 className="text-admin-card-title font-semibold tracking-tight text-admin-text">
            {title}
          </h2>
          {description ? (
            <p className="mt-admin-1 text-admin-body text-admin-muted">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="p-admin-6">{children}</div>
    </section>
  );
}

export function Alert({
  variant,
  children,
  className,
}: {
  variant: "success" | "error" | "warning";
  children: ReactNode;
  className?: string;
}) {
  const styles = {
    success:
      "border-admin-success-border bg-admin-success-muted text-admin-success",
    error: "border-admin-danger-border bg-admin-danger-muted text-admin-danger",
    warning:
      "border-admin-warning-border bg-admin-warning-muted text-admin-warning",
  }[variant];

  return (
    <p
      className={cx(
        "rounded-admin-lg border px-admin-4 py-admin-3 text-admin-body",
        styles,
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Badge({
  variant,
  children,
}: {
  variant: "published" | "draft" | "neutral";
  children: ReactNode;
}) {
  const styles = {
    published:
      "border-admin-success-border bg-admin-success-muted text-admin-success",
    draft:
      "border-admin-warning-border bg-admin-warning-muted text-admin-warning",
    neutral: "border-admin-border bg-admin-surface-muted text-admin-muted",
  }[variant];

  return (
    <span
      className={cx(
        "inline-flex rounded-admin-sm border px-admin-2 py-0.5 text-admin-caption font-medium",
        styles,
      )}
    >
      {children}
    </span>
  );
}

export function DangerZone({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-admin-lg border border-admin-danger-border bg-admin-danger-muted p-admin-6">
      <h2 className="text-admin-card-title font-semibold tracking-tight text-admin-danger">
        {title}
      </h2>
      <p className="mt-admin-2 text-admin-body text-admin-text">{description}</p>
      <div className="mt-admin-4">{children}</div>
    </section>
  );
}

export function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-admin-lg border border-admin-border bg-admin-surface">
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-admin-lg border border-dashed border-admin-border bg-admin-surface px-admin-6 py-admin-10 text-center">
      <h2 className="text-admin-page-title font-semibold tracking-tight text-admin-text">
        {title}
      </h2>
      <p className="mt-admin-2 text-admin-body text-admin-muted">{description}</p>
      {action ? <div className="mt-admin-6">{action}</div> : null}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-admin-4 sm:p-admin-6">
      <button
        type="button"
        className="absolute inset-0 bg-admin-overlay backdrop-blur-sm"
        aria-label="Zavřít dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={cx(
          "relative z-10 w-full rounded-admin-xl border border-admin-border bg-admin-surface p-admin-6 shadow-admin-md",
          sizes[size],
        )}
      >
        <h3
          id="admin-modal-title"
          className="text-base font-semibold tracking-tight text-admin-text"
        >
          {title}
        </h3>
        {description ? (
          <p className="mt-admin-2 text-admin-body leading-admin-relaxed text-admin-muted">
            {description}
          </p>
        ) : null}
        <div className="mt-admin-6">{children}</div>
      </div>
    </div>
  );
}

export const inputClassName =
  "h-10 w-full rounded-admin-md border border-admin-border bg-admin-surface px-admin-3 text-admin-body text-admin-text outline-none transition placeholder:text-admin-faint focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/20";

export const selectClassName = inputClassName;

export const textareaClassName = inputClassName;

export const fileInputClassName =
  "block w-full text-admin-body text-admin-muted file:mr-admin-3 file:h-9 file:rounded-admin-md file:border-0 file:bg-admin-primary file:px-admin-3 file:text-admin-body file:font-medium file:text-admin-primary-foreground hover:file:bg-admin-primary-hover";
