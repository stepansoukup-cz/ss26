import "server-only";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const RATE_LIMIT_ERROR =
  "Příliš mnoho pokusů, zkuste to za chvíli.";

type RateLimitRow = {
  attempts: number;
  expiresAt: Date;
};

export type RateLimitConfig = {
  key: string;
  maxAttempts: number;
  windowMs: number;
};

function firstHeaderIp(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

export async function getClientIp() {
  const headerList = await headers();

  return (
    firstHeaderIp(headerList.get("x-forwarded-for")) ??
    firstHeaderIp(headerList.get("x-real-ip")) ??
    firstHeaderIp(headerList.get("cf-connecting-ip")) ??
    "unknown"
  );
}

export async function buildRateLimitKey(scope: string) {
  return `${scope}:${await getClientIp()}`;
}

export async function isRateLimited({
  key,
  maxAttempts,
}: Pick<RateLimitConfig, "key" | "maxAttempts">) {
  const now = new Date();
  const rows = await prisma.$queryRaw<RateLimitRow[]>`
    SELECT "attempts", "expiresAt"
    FROM "RateLimit"
    WHERE "key" = ${key}
    LIMIT 1
  `;
  const row = rows[0];

  if (!row) {
    return false;
  }

  if (row.expiresAt <= now) {
    await resetRateLimit(key);
    return false;
  }

  return row.attempts >= maxAttempts;
}

export async function recordRateLimitAttempt({
  key,
  maxAttempts,
  windowMs,
}: RateLimitConfig) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<RateLimitRow[]>`
      SELECT "attempts", "expiresAt"
      FROM "RateLimit"
      WHERE "key" = ${key}
      LIMIT 1
      FOR UPDATE
    `;
    const row = rows[0];

    if (!row || row.expiresAt <= now) {
      await tx.$executeRaw`
        INSERT INTO "RateLimit" ("key", "attempts", "windowStart", "expiresAt", "updatedAt")
        VALUES (${key}, 1, ${now}, ${expiresAt}, ${now})
        ON CONFLICT ("key") DO UPDATE SET
          "attempts" = 1,
          "windowStart" = ${now},
          "expiresAt" = ${expiresAt},
          "updatedAt" = ${now}
      `;
      return false;
    }

    const attempts = row.attempts + 1;
    await tx.$executeRaw`
      UPDATE "RateLimit"
      SET "attempts" = ${attempts}, "updatedAt" = ${now}
      WHERE "key" = ${key}
    `;

    return attempts > maxAttempts;
  });
}

export async function resetRateLimit(key: string) {
  await prisma.$executeRaw`
    DELETE FROM "RateLimit"
    WHERE "key" = ${key}
  `;
}
