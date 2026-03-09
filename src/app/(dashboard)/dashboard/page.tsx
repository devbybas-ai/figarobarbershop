import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatCurrency, formatTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    todayAppointments,
    todayWalkIns,
    todayRevenue,
    activeBarbers,
    totalClients,
    upcomingAppointments,
    recentAppointments,
    lowStockProducts,
  ] = await Promise.all([
    db.appointment.count({
      where: { scheduledAt: { gte: today, lt: tomorrow } },
    }),
    db.appointment.count({
      where: { scheduledAt: { gte: today, lt: tomorrow }, type: "WALK_IN" },
    }),
    db.payment.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
    }),
    db.barber.count({ where: { isActive: true } }),
    db.client.count({ where: { deletedAt: null } }),
    db.appointment.findMany({
      where: { scheduledAt: { gte: new Date() }, status: "SCHEDULED" },
      include: { client: true, barber: true, items: { include: { service: true } } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    db.appointment.findMany({
      where: { status: "COMPLETED" },
      include: { client: true, barber: true },
      orderBy: { completedAt: "desc" },
      take: 5,
    }),
    db.product.findMany({
      include: { inventoryItems: true },
      where: {
        inventoryItems: {
          some: {
            quantity: { lte: 5 },
          },
        },
      },
    }),
  ]);

  return {
    todayAppointments,
    todayWalkIns,
    todayRevenue: Number(todayRevenue._sum.amount ?? 0),
    activeBarbers,
    totalClients,
    upcomingAppointments,
    recentAppointments,
    lowStockProducts,
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: "Today's Appointments",
      value: String(stats.todayAppointments),
      accent: "text-figaro-gold",
    },
    { label: "Walk-ins Today", value: String(stats.todayWalkIns), accent: "text-figaro-teal" },
    {
      label: "Revenue (Today)",
      value: formatCurrency(stats.todayRevenue),
      accent: "text-figaro-gold",
    },
    { label: "Active Barbers", value: String(stats.activeBarbers), accent: "text-figaro-teal" },
    { label: "Total Clients", value: String(stats.totalClients), accent: "text-figaro-gold" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-figaro-cream">Barbershop Administration</h2>
      <p className="mt-1 text-figaro-cream/60">Figaro Barbershop Leucadia at a glance.</p>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
              {card.label}
            </p>
            <p className={`mt-2 text-3xl font-bold ${card.accent}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-figaro-gold">
            Upcoming Appointments
          </h3>
          {stats.upcomingAppointments.length === 0 ? (
            <p className="mt-4 text-sm text-figaro-cream/40">No upcoming appointments.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.upcomingAppointments.map((apt) => (
                <li
                  key={apt.id}
                  className="flex items-center justify-between border-b border-figaro-gold/5 pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-figaro-cream">
                      {apt.client.firstName} {apt.client.lastName}
                    </p>
                    <p className="text-xs text-figaro-cream/40">
                      with {apt.barber.firstName} &middot;{" "}
                      {apt.items.map((i) => i.service.name).join(", ")}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-figaro-teal">
                    {formatTime(apt.scheduledAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Completed */}
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-figaro-gold">
            Recently Completed
          </h3>
          {stats.recentAppointments.length === 0 ? (
            <p className="mt-4 text-sm text-figaro-cream/40">No completed appointments yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.recentAppointments.map((apt) => (
                <li
                  key={apt.id}
                  className="flex items-center justify-between border-b border-figaro-gold/5 pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-figaro-cream">
                      {apt.client.firstName} {apt.client.lastName}
                    </p>
                    <p className="text-xs text-figaro-cream/40">by {apt.barber.firstName}</p>
                  </div>
                  <span className="text-sm font-medium text-figaro-gold">
                    {apt.totalPrice ? formatCurrency(Number(apt.totalPrice)) : "\u2014"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts.length > 0 && (
        <div className="mt-6 rounded-sm border border-red-500/20 bg-red-950/20 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400">
            Low Stock Alert
          </h3>
          <ul className="mt-3 space-y-2">
            {stats.lowStockProducts.map((product) => {
              const inv = product.inventoryItems[0];
              return (
                <li key={product.id} className="flex items-center justify-between">
                  <span className="text-sm text-figaro-cream">{product.name}</span>
                  <span className="text-sm font-medium text-red-400">
                    {inv ? `${inv.quantity} left` : "No stock data"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
