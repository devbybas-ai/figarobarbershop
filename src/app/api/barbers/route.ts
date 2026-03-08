import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const barbers = await db.barber.findMany({
    where: { isActive: true },
    orderBy: { firstName: "asc" },
  });
  return NextResponse.json(barbers);
}
