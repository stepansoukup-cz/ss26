"use server";

import { contactFormSchema } from "@/lib/validations/contact";
import { sendContactEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/site-settings";

export type ContactFormState = {
  success?: string;
  error?: string;
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

  const settings = await getSiteSettings();

  if (!settings.contactEmail) {
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

    return { success: "Zpráva byla odeslána. Díky!" };
  } catch {
    return {
      error:
        "Zprávu se nepodařilo odeslat. Zkus to prosím později nebo napiš přímo na e-mail.",
    };
  }
}
