import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const barbers = await db.barber.findMany({
      where: { isActive: true },
      orderBy: { firstName: "asc" },
    });
    return NextResponse.json(barbers);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
