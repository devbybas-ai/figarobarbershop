"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface BarberDashboardData {
  barber: { id: string; firstName: string; barberType: string; commissionRate: number };
  todayAppointments: Array<{
    id: string;
    status: string;
    type: string;
    scheduledAt: string;
    totalPrice: string | null;
    client: { firstName: string; lastName: string };
    items: Array<{ service: { name: string } }>;
  }>;
  todayStats: { appointments: number; revenue: number; tips: number };
  weeklyStats: { appointments: number; revenue: number; tips: number };
  upcomingAppointments: Array<{
    id: string;
    scheduledAt: string;
    client: { firstName: string; lastName: string };
    items: Array<{ service: { name: string } }>;
  }>;
  recentPayments: Array<{
    id: string;
    amount: string;
    method: string;
    tip: string | null;
    barberCut: string | null;
    createdAt: string;
    appointment: { client: { firstName: string; lastName: string } };
  }>;
}

export default function MyDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<BarberDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [barberSlug, setBarberSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/barbers")
      .then((r) => r.json())
      .then((barbers: Array<{ userId: string; firstName: string }>) => {
        const mine = barbers.find((b) => b.userId === session.user.id);
        if (mine) setBarberSlug(mine.firstName.toLowerCase());
      });
  }, [session]);

  useEffect(() => {
    if (!barberSlug) return;
    fetch(`/api/barbers/${barberSlug}/dashboard`)
      .then((r) => r.json())
      .then((d: BarberDashboardData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [barberSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-figaro-teal border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-figaro-cream/60">Could not load dashboard data.</p>;
  }

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-500/20 text-blue-400",
    IN_PROGRESS: "bg-yellow-500/20 text-yellow-400",
    COMPLETED: "bg-green-500/20 text-green-400",
    NO_SHOW: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-figaro-cream">
          Welcome back, {data.barber.firstName}
        </h1>
        <p className="mt-1 text-sm text-figaro-cream/50">
          {data.barber.barberType === "BOOTH_RENTAL" ? "Booth Rental" : `Commission (${data.barber.commissionRate}%)`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Today's Clients", value: data.todayStats.appointments },
          { label: "Today's Revenue", value: `$${data.todayStats.revenue.toFixed(0)}` },
          { label: "Today's Tips", value: `$${data.todayStats.tips.toFixed(0)}` },
          { label: "Week Revenue", value: `$${data.weeklyStats.revenue.toFixed(0)}` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-4"
          >
            <p className="text-xs text-figaro-cream/50">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-figaro-cream">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
        <h2 className="text-lg font-semibold text-figaro-cream">Today&apos;s Queue</h2>
        {data.todayAppointments.length === 0 ? (
          <p className="mt-4 text-sm text-figaro-cream/40">No appointments today.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.todayAppointments.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between rounded-sm border border-figaro-cream/5 bg-figaro-black/30 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-figaro-cream">
                    {appt.client.firstName} {appt.client.lastName}
                  </p>
                  <p className="text-xs text-figaro-cream/50">
                    {appt.items.map((i) => i.service.name).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-figaro-cream/60">
                    {new Date(appt.scheduledAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[appt.status] ?? "bg-figaro-cream/10 text-figaro-cream/60"}`}
                  >
                    {appt.status === "IN_PROGRESS" ? "In Chair" : appt.status}
                  </span>
                  {appt.type === "WALK_IN" && (
                    <span className="rounded-full bg-figaro-teal/20 px-2 py-0.5 text-xs text-figaro-teal">
                      Walk-in
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming */}
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
          <h2 className="text-lg font-semibold text-figaro-cream">Upcoming</h2>
          {data.upcomingAppointments.length === 0 ? (
            <p className="mt-4 text-sm text-figaro-cream/40">No upcoming appointments.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {data.upcomingAppointments.map((appt) => (
                <div key={appt.id} className="flex justify-between text-sm">
                  <span className="text-figaro-cream">
                    {appt.client.firstName} {appt.client.lastName}
                  </span>
                  <span className="text-figaro-cream/50">
                    {new Date(appt.scheduledAt).toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    {new Date(appt.scheduledAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
          <h2 className="text-lg font-semibold text-figaro-cream">Recent Payments</h2>
          {data.recentPayments.length === 0 ? (
            <p className="mt-4 text-sm text-figaro-cream/40">No payments yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {data.recentPayments.map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <div>
                    <span className="text-figaro-cream">
                      {p.appointment.client.firstName} {p.appointment.client.lastName}
                    </span>
                    <span className="ml-2 text-xs text-figaro-cream/40">{p.method}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-figaro-gold">
                      ${Number(p.barberCut ?? p.amount).toFixed(0)}
                    </span>
                    {Number(p.tip ?? 0) > 0 && (
                      <span className="ml-1 text-xs text-figaro-teal">+${Number(p.tip).toFixed(0)} tip</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
