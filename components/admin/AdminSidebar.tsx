"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminNavIcon } from "@/components/admin/AdminIcons";
import { adminNavSections } from "@/lib/admin/navigation";

function isActive(
  pathname: string,
  href: string,
  matchPrefix?: boolean,
) {
  if (pathname === href) {
    return true;
  }

  if (matchPrefix) {
    return pathname.startsWith(`${href}/`);
  }

  return false;
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {adminNavSections.map((section) => (
        <div key={section.title}>
          <p className="mb-1.5 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-faint">
            {section.title}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = isActive(pathname, item.href, item.matchPrefix);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition ${
                      active
                        ? "bg-admin-accent-muted font-semibold text-admin-accent"
                        : "font-medium text-admin-muted hover:bg-admin-surface-muted hover:text-admin-text"
                    }`}
                  >
                    <AdminNavIcon
                      name={item.icon}
                      className={`h-[18px] w-[18px] shrink-0 ${active ? "text-admin-accent" : ""}`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
