import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");
  const barberId = searchParams.get("barberId");
  const durationStr = searchParams.get("duration");

  if (!date || !barberId) {
    return NextResponse.json({ error: "date and barberId are required" }, { status: 400 });
  }

  const duration = durationStr ? parseInt(durationStr, 10) : 30;

  // Parse date parts to avoid timezone issues with new Date("YYYY-MM-DD")
  const [yearStr, monthStr, dayStr] = date.split("-");
  const year = parseInt(yearStr ?? "0", 10);
  const month = parseInt(monthStr ?? "0", 10) - 1;
  const day = parseInt(dayStr ?? "0", 10);
  const requestedDate = new Date(year, month, day);
  const jsDay = requestedDate.getDay(); // 0=Sun, 1=Mon, ...
  const dayOfWeek = jsDay === 0 ? 7 : jsDay; // DB uses 1=Mon, 7=Sun

  // Get barber schedule for this day
  const schedule = await db.barberSchedule.findUnique({
    where: { barberId_dayOfWeek: { barberId, dayOfWeek } },
  });

  if (!schedule || schedule.isOff) {
    return NextResponse.json({ availableSlots: [] });
  }

  // Get existing appointments for the barber on this date
  const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
  const endOfDay = new Date(year, month, day + 1, 0, 0, 0, 0);

  const existingAppointments = await db.appointment.findMany({
    where: {
      barberId,
      scheduledAt: { gte: startOfDay, lt: endOfDay },
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
    },
    include: { items: { include: { service: true } } },
  });

  // Build booked time ranges
  const bookedRanges = existingAppointments.map((apt) => {
    const start = new Date(apt.scheduledAt).getTime();
    const totalDuration = apt.items.reduce((sum, item) => sum + item.service.durationMinutes, 0);
    const end = start + totalDuration * 60 * 1000;
    return { start, end };
  });

  // Generate time slots in 30-minute increments
  const timeParts = schedule.startTime.split(":").map(Number);
  const startHour = timeParts[0] ?? 0;
  const startMin = timeParts[1] ?? 0;
  const endParts = schedule.endTime.split(":").map(Number);
  const endHour = endParts[0] ?? 0;
  const endMin = endParts[1] ?? 0;

  const slotStart = new Date(year, month, day, startHour, startMin, 0, 0);
  const scheduleEnd = new Date(year, month, day, endHour, endMin, 0, 0);

  const availableSlots: string[] = [];
  const now = new Date();

  while (slotStart.getTime() + duration * 60 * 1000 <= scheduleEnd.getTime()) {
    const slotEnd = slotStart.getTime() + duration * 60 * 1000;

    // Check if slot is in the past
    const isPast = slotStart < now;

    // Check if slot overlaps any booked range
    const isBooked = bookedRanges.some(
      (range) => slotStart.getTime() < range.end && slotEnd > range.start,
    );

    if (!isPast && !isBooked) {
      // Return "HH:MM" format as the frontend expects
      const hh = String(slotStart.getHours()).padStart(2, "0");
      const mm = String(slotStart.getMinutes()).padStart(2, "0");
      availableSlots.push(`${hh}:${mm}`);
    }

    slotStart.setMinutes(slotStart.getMinutes() + 30);
  }

  return NextResponse.json({ availableSlots });
}
