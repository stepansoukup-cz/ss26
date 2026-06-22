import { createHash, randomBytes } from "node:crypto";
import { Role } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./constants";

export type SessionPayload = {
  userId: string;
  email: string;
  role: Role;
};

type SessionRow = {
  userId: string;
  email: string;
  role: Role;
  expiresAt: Date;
};

function createRawSessionToken() {
  return randomBytes(32).toString("base64url");
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function firstHeaderIp(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

async function getRequestMeta() {
  const headerList = await headers();

  return {
    userAgent: headerList.get("user-agent"),
    ip:
      firstHeaderIp(headerList.get("x-forwarded-for")) ??
      firstHeaderIp(headerList.get("x-real-ip")) ??
      firstHeaderIp(headerList.get("cf-connecting-ip")) ??
      null,
  };
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const tokenHash = hashSessionToken(token);
  const now = new Date();

  try {
    const rows = await prisma.$queryRaw<SessionRow[]>`
      SELECT
        "Session"."userId",
        "User"."email",
        "User"."role",
        "Session"."expiresAt"
      FROM "Session"
      INNER JOIN "User" ON "User"."id" = "Session"."userId"
      WHERE "Session"."tokenHash" = ${tokenHash}
      LIMIT 1
    `;
    const session = rows[0];

    if (!session) {
      return null;
    }

    if (session.expiresAt <= now) {
      await prisma.$executeRaw`
        DELETE FROM "Session"
        WHERE "tokenHash" = ${tokenHash}
      `;
      return null;
    }

    if (!Object.values(Role).includes(session.role)) {
      return null;
    }

    await prisma.$executeRaw`
      UPDATE "Session"
      SET "lastSeenAt" = ${now}
      WHERE "tokenHash" = ${tokenHash}
    `;

    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = createRawSessionToken();
  const tokenHash = hashSessionToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
  const { userAgent, ip } = await getRequestMeta();

  await prisma.session.create({
    data: {
      userId: payload.userId,
      tokenHash,
      userAgent,
      ip,
      lastSeenAt: now,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.$executeRaw`
      DELETE FROM "Session"
      WHERE "tokenHash" = ${hashSessionToken(token)}
    `;
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}
