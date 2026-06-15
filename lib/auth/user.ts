import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "./session";

const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Nejste přihlášeni.");
  }
  return user;
}
