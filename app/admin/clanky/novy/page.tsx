import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getCurrentUser } from "@/lib/auth/user";

export default async function NewArticlePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/prihlaseni");
  }

  return (
    <AdminShell
      title="Nový článek"
      description="Vytvoř koncept nebo rovnou publikuj na blog."
    >
      <ArticleForm />
    </AdminShell>
  );
}
