import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  addStandaloneDonation,
  ensureSubscription,
  getSettings,
  updateCharitySelection,
} from "@/lib/data";
import { sendEmail } from "@/lib/integrations/email";
import { getStripeClient } from "@/lib/integrations/stripe";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const formData = await request.formData();
  const checkoutType = String(formData.get("checkoutType") ?? "subscription");
  const url = new URL(request.url);
  const session = await getSession();
  const stripe = getStripeClient();

  if (checkoutType === "subscription" && !session) {
    return NextResponse.redirect(
      new URL(
        `/login?message=${encodeURIComponent("Please log in before starting a subscription.")}`,
        url.origin,
      ),
      303,
    );
  }

  if (!stripe) {
    if (checkoutType === "subscription" && session) {
      const plan = String(formData.get("plan") ?? "monthly") as "monthly" | "yearly";
      const charityId = String(formData.get("charityId") ?? session.user.selectedCharityId);
      const charityPercentage = Number(
        formData.get("charityPercentage") ?? session.user.charityPercentage,
      );

      await updateCharitySelection(session.user.id, charityId, charityPercentage);
      await ensureSubscription(session.user.id, plan);
      await sendEmail({
        userId: session.user.id,
        email: session.user.email,
        subject: "Subscription activated",
        message:
          "Your demo-mode subscription is now active. You can add scores, enter draws, and manage your dashboard.",
      });

      return NextResponse.redirect(
        new URL(
          `/dashboard?message=${encodeURIComponent("Subscription activated in demo mode.")}`,
          url.origin,
        ),
        303,
      );
    }

    const donorName = session?.user.fullName ?? "Independent donor";
    const donorEmail = session?.user.email ?? "guest@fairwayfund.demo";
    await addStandaloneDonation({
      charityId: String(formData.get("charityId") ?? ""),
      donorName,
      donorEmail,
      amount: Number(formData.get("amount") ?? 0),
      userId: session?.user.id,
    });

    await sendEmail({
      userId: session?.user.id,
      email: donorEmail,
      subject: "Donation received",
      message: "Your independent donation has been recorded in demo mode.",
    });

    return NextResponse.redirect(
      new URL(
        `/subscribe?message=${encodeURIComponent("Donation recorded in demo mode.")}`,
        url.origin,
      ),
      303,
    );
  }

  const settings = await getSettings();

  if (checkoutType === "subscription" && session) {
    const plan = String(formData.get("plan") ?? "monthly") as "monthly" | "yearly";
    const price = plan === "monthly" ? settings.monthlyPrice : settings.yearlyPrice;
    const charityId = String(formData.get("charityId") ?? session.user.selectedCharityId);
    const charityPercentage = String(
      formData.get("charityPercentage") ?? session.user.charityPercentage,
    );
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      success_url: `${env.appUrl}/dashboard?message=${encodeURIComponent("Stripe checkout completed. Waiting for webhook sync.")}`,
      cancel_url: `${env.appUrl}/subscribe?message=${encodeURIComponent("Checkout canceled.")}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: price * 100,
            recurring: { interval: plan === "monthly" ? "month" : "year" },
            product_data: {
              name: `FairwayFund ${plan} subscription`,
            },
          },
        },
      ],
      metadata: {
        checkoutType,
        userId: session.user.id,
        plan,
        charityId,
        charityPercentage,
      },
      customer_email: session.user.email,
    });

    return NextResponse.redirect(checkoutSession.url ?? `${env.appUrl}/dashboard`, 303);
  }

  const amount = Number(formData.get("amount") ?? 0);
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${env.appUrl}/subscribe?message=${encodeURIComponent("Donation checkout completed. Waiting for webhook sync.")}`,
    cancel_url: `${env.appUrl}/subscribe?message=${encodeURIComponent("Donation canceled.")}`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "inr",
          unit_amount: amount * 100,
          product_data: {
            name: "Independent charity donation",
          },
        },
      },
    ],
    metadata: {
      checkoutType,
      charityId: String(formData.get("charityId") ?? ""),
      amount: String(amount),
      donorName: session?.user.fullName ?? "Independent donor",
      donorEmail: session?.user.email ?? "guest@fairwayfund.demo",
      userId: session?.user.id ?? "",
    },
    customer_email: session?.user.email,
  });

  return NextResponse.redirect(checkoutSession.url ?? `${env.appUrl}/subscribe`, 303);
}
