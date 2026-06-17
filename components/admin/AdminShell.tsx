import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/admin/AdminUi";
import { getCurrentUser } from "@/lib/auth/user";

type AdminShellProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  /** Přihlašovací stránky bez sidebaru */
  variant?: "app" | "auth";
};

export async function AdminShell({
  children,
  title,
  description,
  variant = "app",
}: AdminShellProps) {
  const user = await getCurrentUser();

  if (variant === "auth") {
    return (
      <div className="min-h-screen bg-admin-bg text-admin-text">
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-admin-faint">
              Administrace
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="mt-2 text-sm text-admin-muted">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-admin-bg text-admin-text lg:flex">
      <aside className="border-b border-admin-border-subtle bg-admin-sidebar lg:flex lg:w-60 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="border-b border-admin-border-subtle px-5 py-5">
          <Link href="/admin" className="block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-faint">
              Administrace
            </p>
            <p className="mt-1.5 text-sm font-semibold tracking-tight text-admin-text">
              stepansoukup.cz
            </p>
          </Link>
        </div>

        <div className="max-h-[45vh] overflow-y-auto px-3 py-4 lg:max-h-none lg:flex-1">
          <AdminSidebar />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 bg-admin-surface/95 px-5 py-3.5 shadow-admin-sm backdrop-blur-md sm:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-0.5 truncate text-sm text-admin-muted">
                {description}
              </p>
            ) : null}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/admin/profil"
                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition hover:bg-admin-surface-muted"
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover ring-1 ring-admin-border"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-admin-accent-muted text-sm font-semibold text-admin-accent">
                    {user.firstName.charAt(0)}
                  </div>
                )}
                <span className="hidden text-sm font-medium text-admin-text sm:inline">
                  {user.firstName} {user.lastName}
                </span>
              </Link>

              <form action={logoutAction}>
                <Button type="submit" variant="ghost" className="rounded-full px-4 py-2">
                  Odhlásit
                </Button>
              </form>
            </div>
          ) : null}
        </header>

        <main className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
