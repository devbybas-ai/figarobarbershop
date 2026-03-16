import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";
import { stripe } from "@/lib/stripe";
import { z } from "zod/v4";

const PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "STRIPE",
  "ZELLE",
  "CASHAPP",
  "SQUARE",
  "VENMO",
  "OTHER",
] as const;

const createPaymentSchema = z.object({
  appointmentId: z.string().min(1),
  method: z.enum(PAYMENT_METHODS),
  tip: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const { error: authErr } = await apiRequireAuth("STAFF");
  if (authErr) return authErr;

  try {
    const body: unknown = await request.json();
    const data = createPaymentSchema.parse(body);

    const appointment = await db.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { client: true, barber: true, payment: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.payment) {
      return NextResponse.json({ error: "Payment already exists" }, { status: 400 });
    }

    const amount = Number(appointment.totalPrice ?? 0);
    const tip = data.tip ?? 0;
    const barber = appointment.barber;
    const commissionRate = Number(barber.commissionRate);
    const isBoothRental = barber.barberType === "BOOTH_RENTAL";

    // Calculate commission splits
    let shopCut: number;
    let barberCut: number;
    let processedBy: string;

    if (isBoothRental) {
      // Booth rental: barber keeps everything, shop gets $0 from services
      shopCut = 0;
      barberCut = amount;
      processedBy = "BARBER";
    } else {
      // Commission: shop keeps (100 - rate)%, barber gets rate%
      barberCut = Math.round(amount * (commissionRate / 100) * 100) / 100;
      shopCut = Math.round((amount - barberCut) * 100) / 100;
      processedBy = "SHOP";
    }

    if (data.method === "STRIPE") {
      if (!stripe) {
        return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round((amount + tip) * 100),
        currency: "usd",
        metadata: {
          appointmentId: appointment.id,
          clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
          barberId: barber.id,
        },
      });

      const payment = await db.payment.create({
        data: {
          appointmentId: appointment.id,
          barberId: barber.id,
          amount,
          method: "STRIPE",
          stripePaymentId: paymentIntent.id,
          status: "PENDING",
          processedBy,
          tip,
          shopCut,
          barberCut,
          notes: data.notes,
        },
      });

      return NextResponse.json({
        payment,
        clientSecret: paymentIntent.client_secret,
      });
    }

    // Non-Stripe payments — mark as completed immediately
    const payment = await db.payment.create({
      data: {
        appointmentId: appointment.id,
        barberId: barber.id,
        amount,
        method: data.method,
        status: "COMPLETED",
        processedBy,
        tip,
        shopCut,
        barberCut,
        notes: data.notes,
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
