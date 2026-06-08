import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY ?? "";

export const stripe = new Stripe(key || "sk_test_placeholder", {
  apiVersion: "2026-05-27.dahlia" as any,
});

export function stripeEnabled(): boolean {
  return key.length > 0 && !key.includes("XXXX");
}

export const SUBSCRIPTION_PRICE_MXN = 120000; // $1,200 MXN en centavos
export const SUBSCRIPTION_CURRENCY = "mxn";
