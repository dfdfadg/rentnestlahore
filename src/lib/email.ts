import "server-only";

/** Sends transactional email via Resend's HTTP API when configured; logs in development otherwise. */
export async function sendEmail(opts: { to: string; subject: string; text: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email:dev] To: ${opts.to}\nSubject: ${opts.subject}\n\n${opts.text}`);
      return true;
    }
    console.error("[email] RESEND_API_KEY is not configured; email not sent.");
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "RentNest Lahore <no-reply@rentnestlahore.pk>",
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
    }),
  });
  if (!res.ok) console.error("[email] send failed", res.status);
  return res.ok;
}
