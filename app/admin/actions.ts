"use server";

import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import {
  clearSessionCookie,
  getCurrentSessionIdFromCookies,
  setSessionCookie,
} from "@/lib/auth/session";
import { createAndSendLoginCode, verifyLoginCode } from "@/lib/auth/login-code";
import {
  createAndSendPasswordChangeCode,
  verifyPasswordChangeCode,
} from "@/lib/auth/password-change-code";
import { requireUser } from "@/lib/auth/user";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  RATE_LIMIT_ERROR,
  buildRateLimitKey,
  isRateLimited,
  recordRateLimitAttempt,
  resetRateLimit,
} from "@/lib/rate-limit";
import {
  confirmPasswordChangeSchema,
  loginWithCodeSchema,
  loginWithPasswordSchema,
  requestPasswordChangeCodeSchema,
  requestLoginCodeSchema,
  updateProfileSchema,
} from "@/lib/validations/auth";

export type ActionState = {
  error?: string;
  success?: string;
  redirectTo?: string;
  passwordChangeCodeSent?: boolean;
};

const ADMIN_ROLES: Role[] = [Role.ADMIN, Role.EDITOR];
const LOGIN_RATE_LIMIT = {
  maxAttempts: 8,
  windowMs: 10 * 60 * 1000,
};
const PASSWORD_CHANGE_CODE_RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 15 * 60 * 1000,
};

function formatZodError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Neplatná data.";
}

function getLoginRedirectPath(formData: FormData) {
  const next = formData.get("next");
  return typeof next === "string" && next.startsWith("/admin")
    ? next
    : "/admin/profil";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Neočekávaná chyba serveru.";
}

async function establishSession(user: {
  id: string;
  email: string;
  role: Role;
}) {
  if (!ADMIN_ROLES.includes(user.role)) {
    return { error: "K tomuto účtu nemáš přístup do administrace." };
  }

  try {
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return { error: getErrorMessage(error) };
  }

  return { success: "Přihlášení proběhlo úspěšně." };
}

export async function loginWithPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = loginWithPasswordSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { error: formatZodError(parsed.error) };
    }

    const { email, password } = parsed.data;
    const rateLimitKey = await buildRateLimitKey("login");
    if (
      await isRateLimited({
        key: rateLimitKey,
        maxAttempts: LOGIN_RATE_LIMIT.maxAttempts,
      })
    ) {
      return { error: RATE_LIMIT_ERROR };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const blocked = await recordRateLimitAttempt({
        key: rateLimitKey,
        ...LOGIN_RATE_LIMIT,
      });
      if (blocked) {
        return { error: RATE_LIMIT_ERROR };
      }
      return { error: "Nesprávný e-mail nebo heslo." };
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      const blocked = await recordRateLimitAttempt({
        key: rateLimitKey,
        ...LOGIN_RATE_LIMIT,
      });
      if (blocked) {
        return { error: RATE_LIMIT_ERROR };
      }
      return { error: "Nesprávný e-mail nebo heslo." };
    }

    const result = await establishSession(user);
    if (result.error) {
      return result;
    }

    await resetRateLimit(rateLimitKey);

    return {
      success: result.success,
      redirectTo: getLoginRedirectPath(formData),
    };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function loginWithCodeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = loginWithCodeSchema.safeParse({
      email: formData.get("email"),
      code: formData.get("code"),
    });

    if (!parsed.success) {
      return { error: formatZodError(parsed.error) };
    }

    const rateLimitKey = await buildRateLimitKey("login");
    if (
      await isRateLimited({
        key: rateLimitKey,
        maxAttempts: LOGIN_RATE_LIMIT.maxAttempts,
      })
    ) {
      return { error: RATE_LIMIT_ERROR };
    }

    const user = await verifyLoginCode(parsed.data.email, parsed.data.code);
    if (!user) {
      const blocked = await recordRateLimitAttempt({
        key: rateLimitKey,
        ...LOGIN_RATE_LIMIT,
      });
      if (blocked) {
        return { error: RATE_LIMIT_ERROR };
      }
      return { error: "Neplatný nebo expirovaný kód." };
    }

    const result = await establishSession(user);
    if (result.error) {
      return result;
    }

    await resetRateLimit(rateLimitKey);

    return {
      success: result.success,
      redirectTo: getLoginRedirectPath(formData),
    };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
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

export async function revokeSessionAction(formData: FormData) {
  const user = await requireUser();
  const currentSessionId = await getCurrentSessionIdFromCookies();
  const sessionId = formData.get("sessionId");

  if (typeof sessionId !== "string" || !sessionId) {
    return;
  }

  if (sessionId === currentSessionId) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      id: sessionId,
      userId: user.id,
    },
  });

  revalidatePath("/admin/profil");
}

export async function revokeOtherSessionsAction() {
  const user = await requireUser();
  const currentSessionId = await getCurrentSessionIdFromCookies();

  if (!currentSessionId) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      userId: user.id,
      id: { not: currentSessionId },
    },
  });

  revalidatePath("/admin/profil");
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

  const parsed = requestPasswordChangeCodeSchema.safeParse({
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
  const rateLimitKey = await buildRateLimitKey(`password-change:${user.id}`);
  if (
    await isRateLimited({
      key: rateLimitKey,
      maxAttempts: PASSWORD_CHANGE_CODE_RATE_LIMIT.maxAttempts,
    })
  ) {
    return { error: RATE_LIMIT_ERROR };
  }

  const blocked = await recordRateLimitAttempt({
    key: rateLimitKey,
    ...PASSWORD_CHANGE_CODE_RATE_LIMIT,
  });
  if (blocked) {
    return { error: RATE_LIMIT_ERROR };
  }

  try {
    await createAndSendPasswordChangeCode({
      userId: user.id,
      email: user.email,
      pendingPasswordHash: passwordHash,
    });
  } catch {
    return {
      error:
        "Kód se nepodařilo odeslat. Zkontroluj nastavení Resend v .env.local.",
    };
  }

  return {
    success:
      "Staré heslo sedí. Na registrovaný e-mail jsme poslali potvrzovací kód.",
    passwordChangeCodeSent: true,
  };
}

export async function confirmPasswordChangeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = confirmPasswordChangeSchema.safeParse({
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return {
      error: formatZodError(parsed.error),
      passwordChangeCodeSent: true,
    };
  }

  const result = await verifyPasswordChangeCode({
    userId: user.id,
    code: parsed.data.code,
  });

  if (!result.ok) {
    return {
      error: result.error,
      passwordChangeCodeSent: true,
    };
  }

  const currentSessionId = await getCurrentSessionIdFromCookies();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash: result.pendingPasswordHash },
    });

    if (currentSessionId) {
      await tx.session.deleteMany({
        where: {
          userId: user.id,
          id: { not: currentSessionId },
        },
      });
    }
  });

  revalidatePath("/admin/profil");

  return {
    success:
      "Heslo bylo změněno. Ostatní zařízení byla z bezpečnostních důvodů odhlášena.",
  };
}
