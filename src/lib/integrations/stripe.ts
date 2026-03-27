import Stripe from "stripe";
import { env, hasStripeConfig } from "@/lib/env";

let cachedStripe: Stripe | null = null;

export function getStripeClient() {
  if (!hasStripeConfig()) {
    return null;
  }

  if (!cachedStripe) {
    cachedStripe = new Stripe(env.stripeSecretKey as string, {
      apiVersion: "2026-03-25.dahlia",
    });
  }

  return cachedStripe;
}
