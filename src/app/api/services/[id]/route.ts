import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";
import { z } from "zod/v4";

const updateServiceSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.enum(["HAIRCUT", "BEARD", "SHAVE", "COMBO", "OTHER"]).optional(),
  durationMinutes: z.number().int().min(5).optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await apiRequireAuth("OWNER");
  if (error) return error;

  try {
    const { id } = await params;
    const body: unknown = await request.json();
    const data = updateServiceSchema.parse(body);

    const service = await db.service.update({
      where: { id },
      data,
    });

    return NextResponse.json(service);
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await apiRequireAuth("OWNER");
  if (error) return error;

  try {
    const { id } = await params;

    // Soft delete — deactivate instead of removing (preserves appointment history)
    await db.service.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
