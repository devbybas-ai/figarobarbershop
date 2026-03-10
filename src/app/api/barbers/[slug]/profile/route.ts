import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth-utils";

const BARBER_EDITABLE_FIELDS = ["bio", "phone", "imageUrl", "instagram", "facebook", "tiktok"];
const OWNER_EXTRA_FIELDS = [
  "firstName",
  "lastName",
  "commissionRate",
  "title",
  "tagline",
  "specialties",
];

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

  const allowedFields = isOwner
    ? [...BARBER_EDITABLE_FIELDS, ...OWNER_EXTRA_FIELDS]
    : BARBER_EDITABLE_FIELDS;

  // Only allow known editable fields
  const updates: Record<string, string | number | string[] | null> = {};
  for (const field of allowedFields) {
    if (field in body) {
      const value = body[field];
      if (field === "commissionRate") {
        const num = Number(value);
        if (!isNaN(num) && num >= 0 && num <= 100) {
          updates[field] = num;
        }
      } else if (field === "specialties") {
        if (Array.isArray(value) && value.every((v: unknown) => typeof v === "string")) {
          updates[field] = value as string[];
        }
      } else if (value === null || value === "" || typeof value === "string") {
        updates[field] = value === "" ? null : value;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // If firstName changes, also update the linked User.name
  const nameChanged = "firstName" in updates || "lastName" in updates;
  const newFirstName = (updates.firstName as string) ?? barber.firstName;
  const newLastName = (updates.lastName as string) ?? barber.lastName;

  const updated = await db.barber.update({
    where: { id: barber.id },
    data: updates,
  });

  if (nameChanged && barber.user?.id) {
    await db.user.update({
      where: { id: barber.user.id },
      data: { name: `${newFirstName} ${newLastName}` },
    });
  }

  return NextResponse.json(updated);
}
