import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";
import { hasRole } from "@/lib/auth-utils";
import { z } from "zod/v4";

const createTransactionSchema = z.object({
  type: z.enum(["SERVICE_PAYMENT", "BOOTH_RENT", "PRODUCT_PURCHASE", "TIP", "ADJUSTMENT"]),
  amount: z.number().min(0),
  method: z
    .enum(["CASH", "CARD", "STRIPE", "ZELLE", "CASHAPP", "SQUARE", "VENMO", "OTHER"])
    .optional(),
  description: z.string().optional(),
  date: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const type = searchParams.get("type");

  const barber = await db.barber.findFirst({
    where: { firstName: { equals: slug, mode: "insensitive" }, isActive: true },
    select: { id: true, userId: true, firstName: true, barberType: true },
  });

  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const isOwner = hasRole(session.user.role as UserRole, "OWNER");
  const isSelf = barber.userId === session.user.id;
  if (!isOwner && !isSelf) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Build date filter
  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) dateFilter.lte = new Date(endDate + "T23:59:59");

  // For commission barbers, pull from payments table; for booth-rental, pull from barber_transactions
  if (barber.barberType === "COMMISSION") {
    const payments = await db.payment.findMany({
      where: {
        barberId: barber.id,
        status: "COMPLETED",
        ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      },
      include: {
        appointment: {
          select: {
            client: { select: { firstName: true, lastName: true } },
            scheduledAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({
      barber: { id: barber.id, firstName: barber.firstName, barberType: barber.barberType },
      source: "payments",
      transactions: payments,
    });
  }

  // Booth rental — use BarberTransaction table
  const whereClause: Record<string, unknown> = { barberId: barber.id };
  if (Object.keys(dateFilter).length > 0) whereClause.date = dateFilter;
  if (type) whereClause.type = type;

  const transactions = await db.barberTransaction.findMany({
    where: whereClause,
    orderBy: { date: "desc" },
    take: 100,
  });

  return NextResponse.json({
    barber: { id: barber.id, firstName: barber.firstName, barberType: barber.barberType },
    source: "barber_transactions",
    transactions,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const barber = await db.barber.findFirst({
    where: { firstName: { equals: slug, mode: "insensitive" }, isActive: true },
    select: { id: true, userId: true },
  });

  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  const isOwner = hasRole(session.user.role as UserRole, "OWNER");
  const isSelf = barber.userId === session.user.id;
  if (!isOwner && !isSelf) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body: unknown = await req.json();
    const data = createTransactionSchema.parse(body);

    const transaction = await db.barberTransaction.create({
      data: {
        barberId: barber.id,
        type: data.type,
        amount: data.amount,
        method: data.method ?? null,
        description: data.description ?? null,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });

    return NextResponse.json(transaction, { status: 201 });
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
