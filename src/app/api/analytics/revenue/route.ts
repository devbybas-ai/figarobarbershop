import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const { error: authErr } = await apiRequireAuth("OWNER");
  if (authErr) return authErr;

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  // Default to current month
  const now = new Date();
  const rangeStart = startDate
    ? new Date(startDate)
    : new Date(now.getFullYear(), now.getMonth(), 1);
  const rangeEnd = endDate ? new Date(endDate + "T23:59:59") : new Date();

  const dateFilter = { gte: rangeStart, lte: rangeEnd };

  // Get all completed payments in range with barber info
  const payments = await db.payment.findMany({
    where: {
      status: "COMPLETED",
      createdAt: dateFilter,
    },
    include: {
      barber: {
        select: {
          id: true,
          firstName: true,
          barberType: true,
          commissionRate: true,
          boothRentAmount: true,
        },
      },
    },
  });

  // Get booth rent transactions in range
  const boothRentTransactions = await db.barberTransaction.findMany({
    where: {
      type: "BOOTH_RENT",
      date: dateFilter,
    },
  });

  // Get all active barbers for reference
  const barbers = await db.barber.findMany({
    where: { isActive: true },
    select: {
      id: true,
      firstName: true,
      barberType: true,
      commissionRate: true,
      boothRentAmount: true,
    },
  });

  // Calculate totals
  let grossRevenue = 0;
  let shopRevenue = 0;
  let commissionsOwed = 0;
  let totalTips = 0;
  const methodBreakdown: Record<string, number> = {};
  const barberStats: Record<
    string,
    {
      id: string;
      name: string;
      type: string;
      grossRevenue: number;
      shopCut: number;
      barberCut: number;
      tips: number;
      appointmentCount: number;
      methods: Record<string, number>;
    }
  > = {};

  // Initialize barber stats
  for (const b of barbers) {
    barberStats[b.id] = {
      id: b.id,
      name: b.firstName,
      type: b.barberType,
      grossRevenue: 0,
      shopCut: 0,
      barberCut: 0,
      tips: 0,
      appointmentCount: 0,
      methods: {},
    };
  }

  for (const p of payments) {
    const amount = Number(p.amount);
    const tip = Number(p.tip ?? 0);
    const shop = Number(p.shopCut ?? 0);
    const barber = Number(p.barberCut ?? 0);

    grossRevenue += amount;
    shopRevenue += shop;
    totalTips += tip;

    if (p.barber?.barberType === "COMMISSION") {
      commissionsOwed += barber;
    }

    // Method breakdown
    methodBreakdown[p.method] = (methodBreakdown[p.method] ?? 0) + amount;

    // Per-barber stats
    if (p.barberId) {
      const bs = barberStats[p.barberId];
      if (bs) {
        bs.grossRevenue += amount;
        bs.shopCut += shop;
        bs.barberCut += barber;
        bs.tips += tip;
        bs.appointmentCount += 1;
        bs.methods[p.method] = (bs.methods[p.method] ?? 0) + amount;
      }
    }
  }

  // Booth rent calculations
  const boothRentCollected = boothRentTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const boothRentExpected = barbers
    .filter((b) => b.barberType === "BOOTH_RENTAL" && b.boothRentAmount)
    .reduce((sum, b) => sum + Number(b.boothRentAmount), 0);

  // Build per-barber array sorted by gross revenue
  const barberArray = Object.values(barberStats)
    .map((bs) => ({
      ...bs,
      avgTicket:
        bs.appointmentCount > 0
          ? Math.round((bs.grossRevenue / bs.appointmentCount) * 100) / 100
          : 0,
    }))
    .sort((a, b) => b.grossRevenue - a.grossRevenue);

  return NextResponse.json({
    range: {
      start: rangeStart.toISOString(),
      end: rangeEnd.toISOString(),
    },
    totals: {
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      shopRevenue: Math.round(shopRevenue * 100) / 100,
      commissionsOwed: Math.round(commissionsOwed * 100) / 100,
      boothRentExpected,
      boothRentCollected,
      tips: Math.round(totalTips * 100) / 100,
    },
    barbers: barberArray,
    byMethod: methodBreakdown,
  });
}
