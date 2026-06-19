import { z } from "zod";

export const updateSiteNameSchema = z.object({
  siteName: z
    .string()
    .trim()
    .min(1, "Název webu je povinný.")
    .max(120, "Název webu může mít nejvýše 120 znaků."),
});

const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .max(500, `${label} může mít nejvýše 500 znaků.`)
    .transform((value) => (value === "" ? null : value))
    .refine((value) => value === null || /^https?:\/\/.+/i.test(value), {
      message: `${label} musí být kompletní URL začínající http:// nebo https://.`,
    });

const optionalEmail = z
  .string()
  .trim()
  .max(254, "E-mail může mít nejvýše 254 znaků.")
  .transform((value) => (value === "" ? null : value))
  .refine(
    (value) => value === null || z.string().email().safeParse(value).success,
    { message: "Zadej platný e-mail." },
  );

export const updateSiteSocialsSchema = z.object({
  facebookUrl: optionalUrl("Facebook"),
  instagramUrl: optionalUrl("Instagram"),
  spotifyUrl: optionalUrl("Spotify"),
  youtubeUrl: optionalUrl("YouTube"),
  tiktokUrl: optionalUrl("TikTok"),
  contactEmail: optionalEmail,
});
