import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrace | stepansoukup.cz",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="admin-root min-h-screen">{children}</div>;
}
