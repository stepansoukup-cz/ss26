import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { getCurrentUser } from "@/lib/auth/user";

export async function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-full bg-graphite-bg text-graphite-text">
      <header className="border-b border-graphite-border bg-graphite-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-graphite-muted">
              Administrace
            </p>
            <h1 className="text-lg font-medium">{title}</h1>
          </div>
          {user ? (
            <div className="flex items-center gap-3 text-sm">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : null}
              <Link
                href="/admin/profil"
                className="text-graphite-muted transition hover:text-graphite-text"
              >
                Profil
              </Link>
              <Link
                href="/admin/nastaveni-webu"
                className="text-graphite-muted transition hover:text-graphite-text"
              >
                Web
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-graphite-border px-3 py-1.5 transition hover:border-graphite-accent hover:text-graphite-accent"
                >
                  Odhlásit
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
