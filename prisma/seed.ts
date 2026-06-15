import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Chybí ADMIN_EMAIL nebo ADMIN_PASSWORD v proměnných prostředí.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      firstName: "Admin",
      lastName: "",
      passwordHash,
      role: Role.ADMIN,
    },
    update: {
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`Admin uživatel připraven: ${user.email}`);

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      siteName: "stepansoukup.cz",
    },
    update: {},
  });

  console.log("Nastavení webu připraveno.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
