import { prisma } from "@/lib/prisma";

const SITE_SETTINGS_ID = "main";

export async function getSiteSettings() {
  return prisma.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: {
      id: SITE_SETTINGS_ID,
      siteName: "stepansoukup.cz",
    },
    update: {},
  });
}
