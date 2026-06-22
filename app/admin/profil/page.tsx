import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ProfileSettings } from "@/components/admin/ProfileSettings";
import { getCurrentSessionIdFromCookies } from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";

export default async function AdminProfilePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/prihlaseni");
  }

  const currentSessionId = await getCurrentSessionIdFromCookies();
  const sessionRows = await prisma.session.findMany({
    where: {
      userId: user.id,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastSeenAt: "desc" },
    select: {
      id: true,
      userAgent: true,
      ip: true,
      createdAt: true,
      lastSeenAt: true,
    },
  });
  const sessions = sessionRows.map((session) => ({
    ...session,
    createdAt: session.createdAt.toISOString(),
    lastSeenAt: session.lastSeenAt.toISOString(),
  }));

  return (
    <AdminShell
      title="Můj profil"
      description="Osobní údaje, avatar a heslo k administraci."
    >
      <ProfileSettings
        user={user}
        sessions={sessions}
        currentSessionId={currentSessionId}
      />
    </AdminShell>
  );
}
