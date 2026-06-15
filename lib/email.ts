import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY musí být nastaven v .env.local.");
  }
  return new Resend(apiKey);
}

function getFromAddress() {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error("RESEND_FROM_EMAIL musí být nastaven v .env.local.");
  }
  return from;
}

export async function sendLoginCodeEmail(email: string, code: string) {
  const resend = getResendClient();

  await resend.emails.send({
    from: getFromAddress(),
    to: email,
    subject: "Přihlašovací kód do administrace",
    text: [
      "Požádal/a jsi o přihlášení do administrace stepansoukup.cz.",
      "",
      `Tvůj přihlašovací kód: ${code}`,
      "",
      "Kód platí 15 minut. Heslo se nemění — po přihlášení kódem zůstává původní.",
      "",
      "Pokud jsi o kód nežádal/a, tento e-mail ignoruj.",
    ].join("\n"),
  });
}
