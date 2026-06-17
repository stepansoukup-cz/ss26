import { AdminShell } from "@/components/admin/AdminShell";
import { LoginForms } from "@/components/admin/LoginForms";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <AdminShell title="Přihlášení" variant="auth">
      <LoginForms nextPath={params.next} />
    </AdminShell>
  );
}
