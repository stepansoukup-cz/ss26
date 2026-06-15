import { z } from "zod";

export const updateSiteNameSchema = z.object({
  siteName: z
    .string()
    .trim()
    .min(1, "Název webu je povinný.")
    .max(120, "Název webu může mít nejvýše 120 znaků."),
});
