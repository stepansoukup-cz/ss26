"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import {
  clearSessionCookie,
  setSessionCookie,
} from "@/lib/auth/session";
import { createAndSendLoginCode, verifyLoginCode } from "@/lib/auth/login-code";
import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import {
  changePasswordSchema,
  loginWithCodeSchema,
  loginWithPasswordSchema,
  requestLoginCodeSchema,
  updateProfileSchema,
} from "@/lib/validations/auth";

export type ActionState = {
  error?: string;
  success?: string;
};

const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];

function formatZodError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Neplatná data.";
}

async function establishSession(user: {
  id: string;
  email: string;
  role: Role;
}) {
  if (!ADMIN_ROLES.includes(user.role)) {
    return { error: "K tomuto účtu nemáš přístup do administrace." };
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { success: "Přihlášení proběhlo úspěšně." };
}

export async function loginWithPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginWithPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "Nesprávný e-mail nebo heslo." };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: "Nesprávný e-mail nebo heslo." };
  }

  const result = await establishSession(user);
  if (result.error) {
    return result;
  }

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin/profil");
}

export async function loginWithCodeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginWithCodeSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const user = await verifyLoginCode(parsed.data.email, parsed.data.code);
  if (!user) {
    return { error: "Neplatný nebo expirovaný kód." };
  }

  const result = await establishSession(user);
  if (result.error) {
    return result;
  }

  const next = formData.get("next");
  redirect(typeof next === "string" && next.startsWith("/admin") ? next : "/admin/profil");
}

export async function requestLoginCodeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestLoginCodeSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  try {
    await createAndSendLoginCode(parsed.data.email);
  } catch {
    return {
      error:
        "E-mail se nepodařilo odeslat. Zkontroluj nastavení Resend v .env.local.",
    };
  }

  return {
    success:
      "Pokud účet s tímto e-mailem existuje, poslali jsme na něj přihlašovací kód. Platí 15 minut.",
  };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/prihlaseni");
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = updateProfileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
    },
  });

  return { success: "Profil byl uložen." };
}

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
  });

  const currentMatches = await bcrypt.compare(
    parsed.data.currentPassword,
    dbUser.passwordHash,
  );

  if (!currentMatches) {
    return { error: "Současné heslo není správné." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: "Heslo bylo změněno." };
}
