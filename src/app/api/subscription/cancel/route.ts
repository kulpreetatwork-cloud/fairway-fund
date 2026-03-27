import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cancelSubscription, hasActiveSubscriberAccess } from "@/lib/data";
import { sendEmail } from "@/lib/integrations/email";

export async function POST(request: Request) {
  const session = await getSession();
  const url = new URL(request.url);

  if (!session) {
    return NextResponse.redirect(new URL("/login", url.origin), 303);
  }

  const hasAccess = await hasActiveSubscriberAccess(session.user.id);

  if (!hasAccess) {
    return NextResponse.redirect(
      new URL(
        `/subscribe?message=${encodeURIComponent("There is no active subscription to cancel.")}`,
        url.origin,
      ),
      303,
    );
  }

  await cancelSubscription(session.user.id);
  await sendEmail({
    userId: session.user.id,
    email: session.user.email,
    subject: "Subscription canceled",
    message:
      "Your subscription has been marked as canceled. You can reactivate it anytime from the subscribe page.",
  });

  return NextResponse.redirect(
    new URL(
      `/subscribe?message=${encodeURIComponent("Subscription canceled successfully.")}`,
      url.origin,
    ),
    303,
  );
}
