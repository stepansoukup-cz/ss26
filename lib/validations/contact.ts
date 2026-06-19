import { z } from "zod";

export const CONTACT_SUBJECTS = [
  "Obecný dotaz",
  "Poptávka programování webové aplikace",
  "Poptávka nahrávání",
  "Poptávka koncertu kapely Štěpán Soukup",
  "Poptávka grafiky",
] as const;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Jméno je povinné.")
    .max(120, "Jméno může mít nejvýše 120 znaků."),
  email: z.string().trim().email("Zadej platný e-mail."),
  subject: z.enum(CONTACT_SUBJECTS, {
    message: "Vyber, čeho se zpráva týká.",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Dotaz napiš alespoň trochu konkrétněji.")
    .max(5000, "Dotaz může mít nejvýše 5000 znaků."),
  antiSpamAnswer: z.coerce
    .number({ message: "Kontrolní odpověď musí být číslo." })
    .int("Kontrolní odpověď musí být celé číslo."),
});
