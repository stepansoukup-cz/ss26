"use server";

import { contactFormSchema } from "@/lib/validations/contact";
import { sendContactEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/site-settings";
import { prisma } from "@/lib/prisma";
import {
  RATE_LIMIT_ERROR,
  buildRateLimitKey,
  isRateLimited,
  recordRateLimitAttempt,
} from "@/lib/rate-limit";

export type ContactFormState = {
  success?: string;
  error?: string;
};

const CONTACT_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 60 * 60 * 1000,
};

function formatZodError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Neplatná data.";
}

function expectedAntiSpamAnswer() {
  const parts = new Intl.DateTimeFormat("cs-CZ", {
    timeZone: "Europe/Prague",
    day: "numeric",
    month: "numeric",
  }).formatToParts(new Date());

  const day = Number(parts.find((part) => part.type === "day")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  return day + month;
}

export async function sendContactFormAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    antiSpamAnswer: formData.get("antiSpamAnswer"),
  });

  if (!parsed.success) {
    return { error: formatZodError(parsed.error) };
  }

  if (parsed.data.antiSpamAnswer !== expectedAntiSpamAnswer()) {
    return { error: "Kontrolní odpověď nesedí. Sečti den a měsíc dnešního data." };
  }

  const rateLimitKey = await buildRateLimitKey("contact");
  if (
    await isRateLimited({
      key: rateLimitKey,
      maxAttempts: CONTACT_RATE_LIMIT.maxAttempts,
    })
  ) {
    return { error: RATE_LIMIT_ERROR };
  }

  const blocked = await recordRateLimitAttempt({
    key: rateLimitKey,
    ...CONTACT_RATE_LIMIT,
  });
  if (blocked) {
    return { error: RATE_LIMIT_ERROR };
  }

  const message = await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      body: parsed.data.message,
    },
  });

  const settings = await getSiteSettings();

  if (!settings.contactEmail) {
    await prisma.contactMessage.update({
      where: { id: message.id },
      data: {
        emailError:
          "Kontaktní e-mail není nastavený v administraci webu.",
      },
    });

    return {
      error:
        "Kontaktní e-mail zatím není nastavený. Doplň ho prosím v administraci webu.",
    };
  }

  try {
    await sendContactEmail({
      to: settings.contactEmail,
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    await prisma.contactMessage.update({
      where: { id: message.id },
      data: { emailSentAt: new Date(), emailError: null },
    });

    return { success: "Zpráva byla odeslána. Díky!" };
  } catch (error) {
    await prisma.contactMessage.update({
      where: { id: message.id },
      data: {
        emailError:
          error instanceof Error
            ? error.message
            : "Neznámá chyba při odesílání e-mailu.",
      },
    });

    return {
      error:
        "Zprávu se nepodařilo odeslat. Zkus to prosím později nebo napiš přímo na e-mail.",
    };
  }
}
