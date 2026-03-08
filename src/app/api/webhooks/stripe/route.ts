import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret === "whsec_placeholder") {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 503 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      await db.payment.updateMany({
        where: { stripePaymentId: paymentIntent.id },
        data: { status: "COMPLETED" },
      });

      const payment = await db.payment.findFirst({
        where: { stripePaymentId: paymentIntent.id },
      });

      if (payment) {
        await db.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
