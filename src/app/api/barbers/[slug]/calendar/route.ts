import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";
import { hasRole } from "@/lib/auth-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") ?? "day";
  const dateStr = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const barber = await db.barber.findFirst({
    where: { firstName: { equals: slug, mode: "insensitive" }, isActive: true },
    select: { id: true, userId: true, firstName: true },
  });

  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const isOwner = hasRole(session.user.role as UserRole, "OWNER");
  const isSelf = barber.userId === session.user.id;
  if (!isOwner && !isSelf) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const baseDate = new Date(dateStr + "T00:00:00");
  let rangeStart: Date;
  let rangeEnd: Date;

  if (view === "week") {
    rangeStart = new Date(baseDate);
    rangeStart.setDate(rangeStart.getDate() - rangeStart.getDay());
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + 7);
  } else {
    rangeStart = baseDate;
    rangeEnd = new Date(baseDate);
    rangeEnd.setDate(rangeEnd.getDate() + 1);
  }

  const [appointments, schedules] = await Promise.all([
    db.appointment.findMany({
      where: {
        barberId: barber.id,
        scheduledAt: { gte: rangeStart, lt: rangeEnd },
        status: { not: "CANCELLED" },
      },
      include: {
        client: { select: { firstName: true, lastName: true } },
        items: { include: { service: { select: { name: true, durationMinutes: true } } } },
        payment: { select: { status: true, method: true, amount: true } },
      },
      orderBy: { scheduledAt: "asc" },
    }),
    db.barberSchedule.findMany({
      where: { barberId: barber.id },
      orderBy: { dayOfWeek: "asc" },
    }),
  ]);

  return NextResponse.json({
    barber: { id: barber.id, firstName: barber.firstName },
    view,
    date: dateStr,
    rangeStart: rangeStart.toISOString(),
    rangeEnd: rangeEnd.toISOString(),
    appointments,
    schedules,
  });
}
