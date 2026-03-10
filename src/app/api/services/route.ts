import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["HAIRCUT", "BEARD", "SHAVE", "COMBO", "OTHER"]),
  durationMinutes: z.number().int().min(5),
  price: z.number().min(0),
});

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

export async function POST(request: NextRequest) {
  const { error } = await apiRequireAuth("OWNER");
  if (error) return error;

  try {
    const body: unknown = await request.json();
    const data = serviceSchema.parse(body);

    const service = await db.service.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        durationMinutes: data.durationMinutes,
        price: data.price,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
