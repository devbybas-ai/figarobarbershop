"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface SummaryCard {
  label: string;
  value: string;
  change: string;
}

interface RevenueDay {
  day: string;
  revenue: number;
}

interface ServiceSlice {
  name: string;
  value: number;
}

interface BarberStat {
  name: string;
  count: number;
  revenue: number;
}

interface AnalyticsData {
  summary: {
    revenue: { value: number; change: string };
    appointments: { value: number; change: string };
    newClients: { value: number; change: string };
    avgTicket: { value: number; change: string };
  };
  revenueByDay: RevenueDay[];
  serviceBreakdown: ServiceSlice[];
  topBarbers: BarberStat[];
}

const PIE_COLORS = ["#c9a84c", "#5ba5a5", "#d4b96a", "#1a1a1a", "#8b7355"];

function formatCompact(n: number): string {
  return n >= 1000 ? `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `$${Math.round(n)}`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"week" | "month">("week");

  function changeRange(r: "week" | "month") {
    setLoading(true);
    setRange(r);
  }

  useEffect(() => {
    fetch(`/api/analytics?range=${range}`)
      .then((r) => r.json())
      .then((d: AnalyticsData) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [range]);

  const summaryCards: SummaryCard[] = data
    ? [
        {
          label: range === "week" ? "Weekly Revenue" : "Monthly Revenue",
          value: formatCompact(data.summary.revenue.value),
          change: data.summary.revenue.change,
        },
        {
          label: "Appointments",
          value: String(data.summary.appointments.value),
          change: data.summary.appointments.change,
        },
        {
          label: "New Clients",
          value: String(data.summary.newClients.value),
          change: data.summary.newClients.change,
        },
        {
          label: "Avg. Ticket",
          value: `$${Math.round(data.summary.avgTicket.value)}`,
          change: data.summary.avgTicket.change,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-figaro-teal border-t-transparent" />
      </div>
    );
  }

  const hasData = data && (data.summary.revenue.value > 0 || data.summary.appointments.value > 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-figaro-cream">Analytics</h2>
          <p className="mt-1 text-sm text-figaro-cream/50">
            {hasData
              ? "Live data from your appointments and payments."
              : "No data yet. Analytics will populate as appointments are completed."}
          </p>
        </div>
        <div className="flex rounded-sm border border-figaro-gold/20">
          <button
            type="button"
            onClick={() => changeRange("week")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              range === "week"
                ? "bg-figaro-gold text-figaro-dark"
                : "text-figaro-cream/60 hover:text-figaro-cream"
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => changeRange("month")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              range === "month"
                ? "bg-figaro-gold text-figaro-dark"
                : "text-figaro-cream/60 hover:text-figaro-cream"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-5"
          >
            <p className="text-sm text-figaro-cream/50">{card.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-bold text-figaro-gold">{card.value}</p>
              <span
                className={`text-sm font-medium ${
                  card.change.startsWith("-") ? "text-red-400" : "text-green-400"
                }`}
              >
                {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
          <h3 className="text-lg font-semibold text-figaro-cream">Revenue by Day</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenueByDay ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#999" fontSize={12} />
                <YAxis stroke="#999" fontSize={12} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #c9a84c33",
                    borderRadius: "2px",
                  }}
                  labelStyle={{ color: "#f5f0e8" }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#c9a84c" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
          <h3 className="text-lg font-semibold text-figaro-cream">Service Breakdown</h3>
          {data && data.serviceBreakdown.length > 0 ? (
            <>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.serviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.serviceBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #c9a84c33",
                        borderRadius: "2px",
                      }}
                      formatter={(value) => [`${value}%`, "Share"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {data.serviceBreakdown.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    />
                    <span className="text-xs text-figaro-cream/60">
                      {entry.name} ({entry.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-8 text-center text-sm text-figaro-cream/40">
              No completed appointments yet
            </p>
          )}
        </div>
      </div>

      {/* Top Barbers */}
      {data && data.topBarbers.length > 0 && (
        <div className="mt-6 rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
          <h3 className="text-lg font-semibold text-figaro-cream">Top Barbers</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.topBarbers.map((barber, i) => (
              <div
                key={barber.name}
                className="flex items-center gap-4 rounded-sm border border-figaro-gold/5 bg-figaro-black/30 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-figaro-gold/20 text-sm font-bold text-figaro-gold">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-figaro-cream">{barber.name}</p>
                  <p className="text-xs text-figaro-cream/50">{barber.count} appointments</p>
                </div>
                <p className="text-sm font-semibold text-figaro-gold">
                  ${Math.round(barber.revenue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
