import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";

const createClientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error } = await apiRequireAuth("STAFF");
  if (error) return error;

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [clients, total] = await Promise.all([
      db.client.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { appointments: true } },
        },
        take: limit,
        skip: (page - 1) * limit,
      }),
      db.client.count({ where }),
    ]);

    return NextResponse.json({ data: clients, total, page, limit });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error: authErr } = await apiRequireAuth("STAFF");
  if (authErr) return authErr;

  try {
    const body: unknown = await request.json();
    const data = createClientSchema.parse(body);

    const client = await db.client.create({ data });
    return NextResponse.json(client, { status: 201 });
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
