import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe =
  stripeSecretKey && stripeSecretKey !== "sk_test_placeholder"
    ? new Stripe(stripeSecretKey, { apiVersion: "2026-02-25.clover" })
    : null;
