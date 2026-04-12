"use client";

import { useEffect, useState } from "react";

interface RevenueData {
  range: { start: string; end: string };
  totals: {
    grossRevenue: number;
    shopRevenue: number;
    commissionsOwed: number;
    boothRentExpected: number;
    boothRentCollected: number;
    tips: number;
  };
  barbers: Array<{
    id: string;
    name: string;
    type: string;
    grossRevenue: number;
    shopCut: number;
    barberCut: number;
    tips: number;
    appointmentCount: number;
    avgTicket: number;
    methods: Record<string, number>;
  }>;
  byMethod: Record<string, number>;
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/revenue")
      .then((r) => r.json())
      .then((d: RevenueData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-figaro-teal border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-figaro-cream/60">Could not load revenue data.</p>;
  }

  const methodColors: Record<string, string> = {
    CASH: "bg-green-500/20 text-green-400",
    CARD: "bg-blue-500/20 text-blue-400",
    STRIPE: "bg-purple-500/20 text-purple-400",
    ZELLE: "bg-indigo-500/20 text-indigo-400",
    CASHAPP: "bg-emerald-500/20 text-emerald-400",
    VENMO: "bg-cyan-500/20 text-cyan-400",
    SQUARE: "bg-orange-500/20 text-orange-400",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-figaro-cream">Revenue Report</h1>

      {/* Top-level Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Gross Revenue",
            value: `$${data.totals.grossRevenue.toFixed(0)}`,
            color: "text-figaro-cream",
          },
          {
            label: "Shop Revenue",
            value: `$${data.totals.shopRevenue.toFixed(0)}`,
            color: "text-figaro-gold",
          },
          {
            label: "Commissions Owed",
            value: `$${data.totals.commissionsOwed.toFixed(0)}`,
            color: "text-figaro-teal",
          },
          {
            label: "Total Tips",
            value: `$${data.totals.tips.toFixed(0)}`,
            color: "text-green-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-4"
          >
            <p className="text-xs text-figaro-cream/50">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Booth Rent */}
      {data.totals.boothRentExpected > 0 && (
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-4">
          <h2 className="text-sm font-semibold text-figaro-cream">Booth Rent</h2>
          <div className="mt-2 flex gap-8 text-sm">
            <div>
              <span className="text-figaro-cream/50">Expected: </span>
              <span className="text-figaro-cream">
                ${data.totals.boothRentExpected.toFixed(0)}/mo
              </span>
            </div>
            <div>
              <span className="text-figaro-cream/50">Collected: </span>
              <span
                className={
                  data.totals.boothRentCollected >= data.totals.boothRentExpected
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                ${data.totals.boothRentCollected.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Breakdown */}
      <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
        <h2 className="text-lg font-semibold text-figaro-cream">By Payment Method</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(data.byMethod).map(([method, amount]) => (
            <div
              key={method}
              className={`rounded-sm px-4 py-2 ${methodColors[method] ?? "bg-figaro-cream/10 text-figaro-cream/60"}`}
            >
              <p className="text-xs opacity-70">{method}</p>
              <p className="text-lg font-bold">${amount.toFixed(0)}</p>
            </div>
          ))}
          {Object.keys(data.byMethod).length === 0 && (
            <p className="text-sm text-figaro-cream/40">No payments in this period.</p>
          )}
        </div>
      </div>

      {/* Per-Barber Table */}
      <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark">
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold text-figaro-cream">Per-Barber Breakdown</h2>
        </div>
        {data.barbers.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-figaro-cream/40">No barber revenue data.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-y border-figaro-cream/5 text-left text-xs text-figaro-cream/40">
                <th className="px-4 py-3">Barber</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Appts</th>
                <th className="px-4 py-3 text-right">Gross</th>
                <th className="px-4 py-3 text-right">Shop Cut</th>
                <th className="px-4 py-3 text-right">Barber Cut</th>
                <th className="px-4 py-3 text-right">Tips</th>
                <th className="px-4 py-3 text-right">Avg Ticket</th>
              </tr>
            </thead>
            <tbody>
              {data.barbers.map((b) => (
                <tr key={b.id} className="border-b border-figaro-cream/5 text-sm last:border-b-0">
                  <td className="px-4 py-3 font-medium text-figaro-cream">{b.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        b.type === "BOOTH_RENTAL"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-figaro-teal/20 text-figaro-teal"
                      }`}
                    >
                      {b.type === "BOOTH_RENTAL" ? "Booth" : "Commission"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-figaro-cream/60">
                    {b.appointmentCount}
                  </td>
                  <td className="px-4 py-3 text-right text-figaro-cream">
                    ${b.grossRevenue.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right text-figaro-gold">${b.shopCut.toFixed(0)}</td>
                  <td className="px-4 py-3 text-right text-figaro-teal">
                    ${b.barberCut.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-400">
                    {b.tips > 0 ? `$${b.tips.toFixed(0)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-figaro-cream/50">
                    ${b.avgTicket.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
