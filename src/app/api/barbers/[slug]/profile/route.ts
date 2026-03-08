import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth-utils";

const BARBER_EDITABLE_FIELDS = ["bio", "phone", "imageUrl", "instagram", "facebook", "tiktok"];

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const barber = await db.barber.findFirst({
    where: { firstName: { equals: slug, mode: "insensitive" }, isActive: true },
    include: { user: { select: { id: true } } },
  });

  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const isOwner = hasRole(session.user.role, "OWNER");
  const isSelf = barber.user?.id === session.user.id;

  if (!isOwner && !isSelf) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Only allow known editable fields
  const updates: Record<string, string | null> = {};
  for (const field of BARBER_EDITABLE_FIELDS) {
    if (field in body) {
      const value = body[field];
      if (value === null || value === "" || typeof value === "string") {
        updates[field] = value === "" ? null : value;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await db.barber.update({
    where: { id: barber.id },
    data: updates,
  });

  return NextResponse.json(updated);
}
