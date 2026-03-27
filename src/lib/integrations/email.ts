import { Resend } from "resend";
import { env, hasEmailConfig } from "@/lib/env";
import { addNotification } from "@/lib/data";

export async function sendEmail({
  email,
  subject,
  message,
  userId,
}: {
  email: string;
  subject: string;
  message: string;
  userId?: string;
}) {
  await addNotification({ email, subject, message, userId });

  if (!hasEmailConfig()) {
    return { delivered: false, mode: "demo" as const };
  }

  const resend = new Resend(env.resendApiKey);

  await resend.emails.send({
    from: env.senderEmail,
    to: email,
    subject,
    text: message,
  });

  return { delivered: true, mode: "resend" as const };
}
