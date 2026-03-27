import { NextResponse } from "next/server";
import {
  addStandaloneDonation,
  ensureSubscription,
  updateCharitySelection,
  updateSubscriptionStatus,
} from "@/lib/data";
import { getStripeClient } from "@/lib/integrations/stripe";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const stripe = getStripeClient();

  if (!stripe || !env.stripeWebhookSecret) {
    return NextResponse.json({ received: true, mode: "demo" });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata ?? {};

    if (metadata.checkoutType === "subscription" && metadata.userId && metadata.plan) {
      await updateCharitySelection(
        metadata.userId,
        metadata.charityId ?? "",
        Number(metadata.charityPercentage ?? 10),
      );
      await ensureSubscription(metadata.userId, metadata.plan as "monthly" | "yearly");
    }

    if (metadata.checkoutType === "donation") {
      await addStandaloneDonation({
        charityId: metadata.charityId ?? "",
        donorName: metadata.donorName ?? "Independent donor",
        donorEmail: metadata.donorEmail ?? "guest@fairwayfund.demo",
        amount: Number(metadata.amount ?? 0),
        userId: metadata.userId || undefined,
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const userId = subscription.metadata?.userId;

    if (userId) {
      await updateSubscriptionStatus(userId, "canceled");
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    const userId = invoice.parent?.subscription_details?.metadata?.userId;

    if (userId) {
      await updateSubscriptionStatus(userId, "past_due");
    }
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    const userId = invoice.parent?.subscription_details?.metadata?.userId;

    if (userId) {
      await updateSubscriptionStatus(userId, "active");
    }
  }

  return NextResponse.json({ received: true });
}
