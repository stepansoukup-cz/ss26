import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";

export default async function AdminPage() {
  const user = await getCurrentUser();
  redirect(user ? "/admin/profil" : "/admin/prihlaseni");
}
