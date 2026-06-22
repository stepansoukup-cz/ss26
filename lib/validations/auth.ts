import { z } from "zod";

export const loginWithPasswordSchema = z.object({
  email: z.string().trim().email("Zadej platný e-mail."),
  password: z.string().min(1, "Zadej heslo."),
});

export const loginWithCodeSchema = z.object({
  email: z.string().trim().email("Zadej platný e-mail."),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Kód má 6 číslic."),
});

export const requestLoginCodeSchema = z.object({
  email: z.string().trim().email("Zadej platný e-mail."),
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Jméno je povinné."),
  lastName: z.string().trim(),
});

export const requestPasswordChangeCodeSchema = z
  .object({
    currentPassword: z.string().min(1, "Zadej současné heslo."),
    newPassword: z
      .string()
      .min(12, "Nové heslo musí mít alespoň 12 znaků."),
    confirmPassword: z.string().min(1, "Potvrď nové heslo."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Nová hesla se neshodují.",
    path: ["confirmPassword"],
  });

export const confirmPasswordChangeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Kód má 6 číslic."),
});
