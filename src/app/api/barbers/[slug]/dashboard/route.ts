import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";
import { hasRole } from "@/lib/auth-utils";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const barber = await db.barber.findFirst({
    where: { firstName: { equals: slug, mode: "insensitive" }, isActive: true },
    select: { id: true, userId: true, firstName: true, barberType: true, commissionRate: true },
  });

  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 });
  }

  // Only the barber themselves or an owner can view
  const isOwner = hasRole(session.user.role as UserRole, "OWNER");
  const isSelf = barber.userId === session.user.id;
  if (!isOwner && !isSelf) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const [todayAppointments, todayPayments, weekPayments, upcomingAppointments, recentPayments] =
    await Promise.all([
      db.appointment.findMany({
        where: {
          barberId: barber.id,
          scheduledAt: { gte: todayStart, lt: todayEnd },
          status: { not: "CANCELLED" },
        },
        include: {
          client: { select: { firstName: true, lastName: true } },
          items: { include: { service: { select: { name: true } } } },
        },
        orderBy: { scheduledAt: "asc" },
      }),
      db.payment.findMany({
        where: {
          barberId: barber.id,
          status: "COMPLETED",
          createdAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      db.payment.findMany({
        where: {
          barberId: barber.id,
          status: "COMPLETED",
          createdAt: { gte: weekStart, lt: todayEnd },
        },
      }),
      db.appointment.findMany({
        where: {
          barberId: barber.id,
          status: "SCHEDULED",
          scheduledAt: { gte: now },
        },
        include: {
          client: { select: { firstName: true, lastName: true } },
          items: { include: { service: { select: { name: true } } } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
      db.payment.findMany({
        where: { barberId: barber.id, status: "COMPLETED" },
        include: {
          appointment: {
            select: {
              client: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const todayRevenue = todayPayments.reduce((sum, p) => sum + Number(p.barberCut ?? p.amount), 0);
  const todayTips = todayPayments.reduce((sum, p) => sum + Number(p.tip ?? 0), 0);
  const weeklyRevenue = weekPayments.reduce((sum, p) => sum + Number(p.barberCut ?? p.amount), 0);
  const weeklyTips = weekPayments.reduce((sum, p) => sum + Number(p.tip ?? 0), 0);

  return NextResponse.json({
    barber: {
      id: barber.id,
      firstName: barber.firstName,
      barberType: barber.barberType,
      commissionRate: Number(barber.commissionRate),
    },
    todayAppointments,
    todayStats: {
      appointments: todayAppointments.length,
      revenue: todayRevenue,
      tips: todayTips,
    },
    weeklyStats: {
      appointments: weekPayments.length,
      revenue: weeklyRevenue,
      tips: weeklyTips,
    },
    upcomingAppointments,
    recentPayments,
  });
}
