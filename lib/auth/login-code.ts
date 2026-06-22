import { randomInt } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

const CODE_LENGTH = 6;
const CODE_TTL_MINUTES = 15;

function generateNumericCode() {
  return randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, "0");
}

export async function createAndSendLoginCode(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { sent: false as const };
  }

  const code = generateNumericCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

  await prisma.loginCode.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.loginCode.create({
    data: {
      userId: user.id,
      codeHash,
      expiresAt,
    },
  });

  const { sendLoginCodeEmail } = await import("@/lib/email");
  await sendLoginCodeEmail(email, code);

  return { sent: true as const };
}

export async function verifyLoginCode(email: string, code: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return null;
  }

  const activeCodes = await prisma.loginCode.findMany({
    where: {
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const entry of activeCodes) {
    const matches = await bcrypt.compare(code, entry.codeHash);
    if (matches) {
      await prisma.loginCode.update({
        where: { id: entry.id },
        data: { usedAt: new Date() },
      });
      return user;
    }
  }

  return null;
}
