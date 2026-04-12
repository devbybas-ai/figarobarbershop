import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";

const createAppointmentSchema = z.object({
  clientFirstName: z.string().min(1),
  clientLastName: z.string().min(1),
  clientEmail: z.email().optional(),
  clientPhone: z.string().min(1),
  barberId: z.string().min(1),
  serviceIds: z.array(z.string()).min(1),
  scheduledAt: z.iso.datetime(),
  notes: z.string().optional(),
  type: z.enum(["BOOKED", "WALK_IN"]).default("BOOKED"),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const data = createAppointmentSchema.parse(body);

    // Find or create client (restore if soft-deleted)
    let client = data.clientEmail
      ? await db.client.findUnique({ where: { email: data.clientEmail } })
      : null;

    if (client) {
      // Restore soft-deleted client and update info
      if (client.deletedAt) {
        client = await db.client.update({
          where: { id: client.id },
          data: {
            firstName: data.clientFirstName,
            lastName: data.clientLastName,
            phone: data.clientPhone ?? client.phone,
            deletedAt: null,
          },
        });
      }
    } else {
      client = await db.client.create({
        data: {
          firstName: data.clientFirstName,
          lastName: data.clientLastName,
          email: data.clientEmail,
          phone: data.clientPhone,
        },
      });
    }

    // Fetch services for pricing
    const services = await db.service.findMany({
      where: { id: { in: data.serviceIds }, isActive: true },
    });

    if (services.length === 0) {
      return NextResponse.json({ error: "No valid services selected" }, { status: 400 });
    }

    const totalPrice = services.reduce((sum, s) => sum + Number(s.price), 0);
    const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);
    const scheduledAt = new Date(data.scheduledAt);
    const scheduledEnd = new Date(scheduledAt.getTime() + totalDuration * 60_000);

    // Create appointment in a transaction with conflict check to prevent double-booking
    const appointment = await db.$transaction(async (tx) => {
      // Check for overlapping appointments for this barber
      const conflict = await tx.appointment.findFirst({
        where: {
          barberId: data.barberId,
          status: { in: ["SCHEDULED", "IN_PROGRESS"] },
          scheduledAt: { lt: scheduledEnd },
          // Existing appointment ends after our start
          AND: {
            scheduledAt: {
              gte: new Date(scheduledAt.getTime() - totalDuration * 60_000),
            },
          },
        },
      });

      if (conflict) {
        throw new Error("TIME_CONFLICT");
      }

      return tx.appointment.create({
        data: {
          clientId: client.id,
          barberId: data.barberId,
          scheduledAt,
          type: data.type,
          notes: data.notes,
          totalPrice,
          items: {
            create: services.map((s) => ({
              serviceId: s.id,
              price: s.price,
            })),
          },
        },
        include: {
          client: true,
          barber: true,
          items: { include: { service: true } },
        },
      });
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 },
      );
    }
    if (error instanceof Error && error.message === "TIME_CONFLICT") {
      return NextResponse.json(
        { error: "This time slot is no longer available. Please select another time." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { error } = await apiRequireAuth("STAFF");
  if (error) return error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const barberId = searchParams.get("barberId");

    const where: Record<string, unknown> = {};

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      where.scheduledAt = { gte: start, lt: end };
    }

    if (barberId) {
      where.barberId = barberId;
    }

    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "200", 10)));

    const appointments = await db.appointment.findMany({
      where,
      include: {
        client: true,
        barber: true,
        items: { include: { service: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: limit,
    });

    return NextResponse.json(appointments);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
