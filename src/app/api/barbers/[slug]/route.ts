import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const barber = await db.barber.findFirst({
    where: {
      firstName: { equals: slug, mode: "insensitive" },
      isActive: true,
    },
    include: {
      schedules: {
        select: {
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          isOff: true,
        },
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });

  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  return NextResponse.json(barber);
}
