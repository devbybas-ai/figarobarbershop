import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { price: "asc" }],
    });
    return NextResponse.json(services);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
