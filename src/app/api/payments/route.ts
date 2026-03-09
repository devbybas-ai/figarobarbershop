import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";
import { stripe } from "@/lib/stripe";
import { z } from "zod/v4";

const createPaymentSchema = z.object({
  appointmentId: z.string().min(1),
  method: z.enum(["CASH", "CARD", "STRIPE"]),
});

export async function POST(request: NextRequest) {
  const { error: authErr } = await apiRequireAuth("STAFF");
  if (authErr) return authErr;

  try {
    const body: unknown = await request.json();
    const data = createPaymentSchema.parse(body);

    const appointment = await db.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { client: true, payment: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.payment) {
      return NextResponse.json({ error: "Payment already exists" }, { status: 400 });
    }

    const amount = Number(appointment.totalPrice ?? 0);

    if (data.method === "STRIPE") {
      if (!stripe) {
        return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
        metadata: {
          appointmentId: appointment.id,
          clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
        },
      });

      const payment = await db.payment.create({
        data: {
          appointmentId: appointment.id,
          amount,
          method: "STRIPE",
          stripePaymentId: paymentIntent.id,
          status: "PENDING",
        },
      });

      return NextResponse.json({
        payment,
        clientSecret: paymentIntent.client_secret,
      });
    }

    // Cash or Card (non-Stripe) — mark as completed immediately
    const payment = await db.payment.create({
      data: {
        appointmentId: appointment.id,
        amount,
        method: data.method,
        status: "COMPLETED",
      },
    });

    await db.appointment.update({
      where: { id: appointment.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
