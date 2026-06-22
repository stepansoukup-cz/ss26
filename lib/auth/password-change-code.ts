import { randomInt, randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { sendPasswordChangeCodeEmail } from "@/lib/email";

const CODE_LENGTH = 6;
const CODE_TTL_MINUTES = 15;
const MAX_CODE_ATTEMPTS = 5;

type PasswordChangeCodeRow = {
  id: string;
  codeHash: string;
  pendingPasswordHash: string;
  attempts: number;
};

function generateNumericCode() {
  return randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, "0");
}

export async function createAndSendPasswordChangeCode({
  userId,
  email,
  pendingPasswordHash,
}: {
  userId: string;
  email: string;
  pendingPasswordHash: string;
}) {
  const code = generateNumericCode();
  const codeHash = await bcrypt.hash(code, 10);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "PasswordChangeCode"
      SET "usedAt" = ${now}
      WHERE "userId" = ${userId}
        AND "usedAt" IS NULL
    `;

    await tx.$executeRaw`
      INSERT INTO "PasswordChangeCode" (
        "id",
        "userId",
        "codeHash",
        "pendingPasswordHash",
        "attempts",
        "expiresAt",
        "createdAt"
      )
      VALUES (
        ${randomUUID()},
        ${userId},
        ${codeHash},
        ${pendingPasswordHash},
        0,
        ${expiresAt},
        ${now}
      )
    `;
  });

  await sendPasswordChangeCodeEmail(email, code);
}

export async function verifyPasswordChangeCode({
  userId,
  code,
}: {
  userId: string;
  code: string;
}) {
  const now = new Date();
  const rows = await prisma.$queryRaw<PasswordChangeCodeRow[]>`
    SELECT "id", "codeHash", "pendingPasswordHash", "attempts"
    FROM "PasswordChangeCode"
    WHERE "userId" = ${userId}
      AND "usedAt" IS NULL
      AND "expiresAt" > ${now}
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;
  const entry = rows[0];

  if (!entry) {
    return {
      ok: false as const,
      error: "Kód je neplatný nebo expiroval. Požádej o nový kód.",
    };
  }

  if (entry.attempts >= MAX_CODE_ATTEMPTS) {
    return {
      ok: false as const,
      error: "Kód měl příliš mnoho chybných pokusů. Požádej o nový kód.",
    };
  }

  const matches = await bcrypt.compare(code, entry.codeHash);
  if (!matches) {
    await prisma.$executeRaw`
      UPDATE "PasswordChangeCode"
      SET "attempts" = "attempts" + 1
      WHERE "id" = ${entry.id}
    `;

    return {
      ok: false as const,
      error: "Zadaný kód nesedí.",
    };
  }

  await prisma.$executeRaw`
    UPDATE "PasswordChangeCode"
    SET "usedAt" = ${now}
    WHERE "id" = ${entry.id}
  `;

  return {
    ok: true as const,
    pendingPasswordHash: entry.pendingPasswordHash,
  };
}
