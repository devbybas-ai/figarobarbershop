import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { hasRole } from "@/lib/auth-utils";
import { hash } from "bcryptjs";

function ownerOnly(session: { user: { role: string } } | null) {
  if (!session?.user) return { error: "Unauthorized", status: 401 };
  if (!hasRole(session.user.role as "OWNER", "OWNER")) return { error: "Forbidden", status: 403 };
  return null;
}

// POST - Add a new barber (owner only)
export async function POST(req: Request) {
  const session = await auth();
  const authError = ownerOnly(session);
  if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });

  const body = await req.json();
  const { firstName, lastName, email, phone, bio, commissionRate } = body;

  if (!firstName || !lastName || typeof firstName !== "string" || typeof lastName !== "string") {
    return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
  }

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required for login" }, { status: 400 });
  }

  // Check if email is already taken
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  // Default password (owner should tell the barber to change it)
  const defaultPassword = "figaro2026";
  const passwordHash = await hash(defaultPassword, 12);

  // Create user + barber in a transaction
  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        passwordHash,
        role: "BARBER",
      },
    });

    const barber = await tx.barber.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ?? null,
        bio: bio ?? null,
        commissionRate: commissionRate ?? 0,
        isActive: true,
        user: { connect: { id: user.id } },
      },
    });

    // Create default schedule (Mon-Sat, 10:30-18:30, Sun off)
    const schedules = [];
    for (let day = 0; day < 7; day++) {
      schedules.push({
        barberId: barber.id,
        dayOfWeek: day,
        startTime: day === 0 || day === 6 ? "10:00" : "10:30",
        endTime: day === 0 || day === 6 ? "16:00" : "18:30",
        isOff: day === 0,
      });
    }
    await tx.barberSchedule.createMany({ data: schedules });

    return barber;
  });

  return NextResponse.json(result, { status: 201 });
}

// DELETE - Remove a barber (owner only, soft deactivation)
export async function DELETE(req: Request) {
  const session = await auth();
  const authError = ownerOnly(session);
  if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });

  const { searchParams } = new URL(req.url);
  const barberId = searchParams.get("id");

  if (!barberId) {
    return NextResponse.json({ error: "Barber ID is required" }, { status: 400 });
  }

  const barber = await db.barber.findUnique({
    where: { id: barberId },
    include: { user: { select: { id: true, email: true } } },
  });

  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  // Prevent owner from removing themselves
  if (barber.user?.id === session!.user.id) {
    return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
  }

  // Soft deactivate: set isActive = false, don't delete data
  await db.barber.update({
    where: { id: barberId },
    data: { isActive: false },
  });

  return NextResponse.json({ message: "Barber deactivated" });
}

// PATCH - Owner edit of barber (names, commission, active status)
export async function PATCH(req: Request) {
  const session = await auth();
  const authError = ownerOnly(session);
  if (authError) return NextResponse.json({ error: authError.error }, { status: authError.status });

  const body = await req.json();
  const { id, firstName, lastName, commissionRate, isActive } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Barber ID is required" }, { status: 400 });
  }

  const barber = await db.barber.findUnique({ where: { id } });
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  if (firstName && typeof firstName === "string") updates.firstName = firstName.trim();
  if (lastName && typeof lastName === "string") updates.lastName = lastName.trim();
  if (commissionRate !== undefined && typeof commissionRate === "number") {
    updates.commissionRate = commissionRate;
  }
  if (isActive !== undefined && typeof isActive === "boolean") updates.isActive = isActive;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const updated = await db.barber.update({
    where: { id },
    data: updates,
  });

  return NextResponse.json(updated);
}
