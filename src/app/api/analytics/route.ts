import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiRequireAuth } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  const { error } = await apiRequireAuth("STAFF");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") ?? "week"; // "week" | "month"

  const now = new Date();
  const startDate = new Date(now);

  if (range === "month") {
    startDate.setDate(startDate.getDate() - 30);
  } else {
    startDate.setDate(startDate.getDate() - 7);
  }

  try {
    // === Summary Stats ===
    const [appointments, payments, newClients] = await Promise.all([
      db.appointment.findMany({
        where: { scheduledAt: { gte: startDate } },
        include: { items: { include: { service: true } } },
      }),
      db.payment.findMany({
        where: {
          createdAt: { gte: startDate },
          status: "COMPLETED",
        },
      }),
      db.client.count({
        where: {
          createdAt: { gte: startDate },
          deletedAt: null,
        },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const completedAppointments = appointments.filter((a) => a.status === "COMPLETED");
    const avgTicket =
      completedAppointments.length > 0 ? totalRevenue / completedAppointments.length : 0;

    // === Previous period for comparison ===
    const prevStart = new Date(startDate);
    const prevEnd = new Date(startDate);
    if (range === "month") {
      prevStart.setDate(prevStart.getDate() - 30);
    } else {
      prevStart.setDate(prevStart.getDate() - 7);
    }

    const [prevPayments, prevAppointments, prevClients] = await Promise.all([
      db.payment.count({
        where: {
          createdAt: { gte: prevStart, lt: prevEnd },
          status: "COMPLETED",
        },
      }),
      db.appointment.count({
        where: { scheduledAt: { gte: prevStart, lt: prevEnd } },
      }),
      db.client.count({
        where: {
          createdAt: { gte: prevStart, lt: prevEnd },
          deletedAt: null,
        },
      }),
    ]);

    const prevRevenue = await db.payment.aggregate({
      where: {
        createdAt: { gte: prevStart, lt: prevEnd },
        status: "COMPLETED",
      },
      _sum: { amount: true },
    });
    const prevTotalRevenue = Number(prevRevenue._sum.amount ?? 0);

    function pctChange(current: number, previous: number): string {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      const sign = change >= 0 ? "+" : "";
      return `${sign}${Math.round(change)}%`;
    }

    // === Revenue by Day of Week ===
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const revenueByDay = dayNames.map((day) => ({ day, revenue: 0 }));

    for (const payment of payments) {
      const dayIndex = new Date(payment.createdAt).getDay();
      const entry = revenueByDay[dayIndex];
      if (entry) {
        entry.revenue += Number(payment.amount);
      }
    }

    // === Service Category Breakdown ===
    const categoryCount: Record<string, number> = {};
    for (const appt of completedAppointments) {
      for (const item of appt.items) {
        const cat = item.service.category;
        categoryCount[cat] = (categoryCount[cat] ?? 0) + 1;
      }
    }
    const totalServices = Object.values(categoryCount).reduce((a, b) => a + b, 0);
    const categoryLabels: Record<string, string> = {
      HAIRCUT: "Haircuts",
      BEARD: "Beard",
      SHAVE: "Shaves",
      COMBO: "Combos",
      OTHER: "Other",
    };
    const serviceBreakdown = Object.entries(categoryCount).map(([cat, count]) => ({
      name: categoryLabels[cat] ?? cat,
      value: totalServices > 0 ? Math.round((count / totalServices) * 100) : 0,
    }));

    // === Top Barbers ===
    const barberRevenue: Record<string, { name: string; count: number; revenue: number }> = {};
    for (const appt of completedAppointments) {
      const barberId = appt.barberId;
      if (!barberRevenue[barberId]) {
        barberRevenue[barberId] = { name: "", count: 0, revenue: 0 };
      }
      barberRevenue[barberId].count += 1;
      barberRevenue[barberId].revenue += Number(appt.totalPrice ?? 0);
    }

    // Fetch barber names
    const barberIds = Object.keys(barberRevenue);
    if (barberIds.length > 0) {
      const barbers = await db.barber.findMany({
        where: { id: { in: barberIds } },
        select: { id: true, firstName: true },
      });
      for (const b of barbers) {
        const entry = barberRevenue[b.id];
        if (entry) {
          entry.name = b.firstName;
        }
      }
    }

    const topBarbers = Object.values(barberRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    return NextResponse.json({
      summary: {
        revenue: { value: totalRevenue, change: pctChange(totalRevenue, prevTotalRevenue) },
        appointments: {
          value: appointments.length,
          change: pctChange(appointments.length, prevAppointments),
        },
        newClients: { value: newClients, change: pctChange(newClients, prevClients) },
        avgTicket: { value: avgTicket, change: pctChange(payments.length, prevPayments) },
      },
      revenueByDay,
      serviceBreakdown,
      topBarbers,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
