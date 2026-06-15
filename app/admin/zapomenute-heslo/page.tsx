import { AdminShell } from "@/components/admin/AdminShell";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AdminShell title="Zapomenuté heslo">
      <ForgotPasswordForm />
    </AdminShell>
  );
}
