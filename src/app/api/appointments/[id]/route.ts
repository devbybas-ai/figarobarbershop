import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";

const updateAppointmentSchema = z.object({
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  notes: z.string().optional(),
  scheduledAt: z.iso.datetime().optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await apiRequireAuth("STAFF");
  if (error) return error;

  try {
    const { id } = await params;

    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        client: true,
        barber: true,
        items: { include: { service: true } },
        payment: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await apiRequireAuth("STAFF");
  if (authError) return authError;

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const data = updateAppointmentSchema.parse(body);

    const existing = await db.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.status) {
      updateData.status = data.status;
      if (data.status === "COMPLETED") {
        updateData.completedAt = new Date();
      }
      if (data.status === "CANCELLED") {
        updateData.cancelledAt = new Date();
      }
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }
    if (data.scheduledAt) {
      updateData.scheduledAt = new Date(data.scheduledAt);
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        barber: true,
        items: { include: { service: true } },
      },
    });

    return NextResponse.json(appointment);
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
