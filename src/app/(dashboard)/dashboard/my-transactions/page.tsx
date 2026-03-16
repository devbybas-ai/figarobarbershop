"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface TransactionData {
  barber: { id: string; firstName: string; barberType: string };
  source: string;
  transactions: Array<{
    id: string;
    amount: string;
    method?: string;
    type?: string;
    description?: string;
    tip?: string | null;
    barberCut?: string | null;
    shopCut?: string | null;
    createdAt?: string;
    date?: string;
    appointment?: {
      client: { firstName: string; lastName: string };
      scheduledAt: string;
    };
  }>;
}

export default function MyTransactionsPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<TransactionData | null>(null);
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
    fetch(`/api/barbers/${barberSlug}/transactions`)
      .then((r) => r.json())
      .then((d: TransactionData) => {
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
    return <p className="text-figaro-cream/60">Could not load transactions.</p>;
  }

  const totalRevenue = data.transactions.reduce(
    (sum, t) => sum + Number(t.barberCut ?? t.amount),
    0,
  );
  const totalTips = data.transactions.reduce(
    (sum, t) => sum + Number(t.tip ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-figaro-cream">My Transactions</h1>
        <p className="mt-1 text-sm text-figaro-cream/50">
          {data.barber.barberType === "BOOTH_RENTAL"
            ? "Your self-logged payments"
            : "Commission payments from shop register"}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-4">
          <p className="text-xs text-figaro-cream/50">Total Earnings</p>
          <p className="mt-1 text-2xl font-bold text-figaro-gold">${totalRevenue.toFixed(0)}</p>
        </div>
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-4">
          <p className="text-xs text-figaro-cream/50">Total Tips</p>
          <p className="mt-1 text-2xl font-bold text-figaro-teal">${totalTips.toFixed(0)}</p>
        </div>
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-4">
          <p className="text-xs text-figaro-cream/50">Transactions</p>
          <p className="mt-1 text-2xl font-bold text-figaro-cream">{data.transactions.length}</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark">
        {data.transactions.length === 0 ? (
          <p className="p-8 text-center text-sm text-figaro-cream/40">No transactions yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-figaro-cream/5 text-left text-xs text-figaro-cream/40">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Your Cut</th>
                <th className="px-4 py-3 text-right">Tip</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-figaro-cream/5 text-sm last:border-b-0"
                >
                  <td className="px-4 py-3 text-figaro-cream/60">
                    {new Date(t.createdAt ?? t.date ?? "").toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-figaro-cream">
                    {t.appointment
                      ? `${t.appointment.client.firstName} ${t.appointment.client.lastName}`
                      : t.description ?? t.type ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-figaro-cream/50">{t.method ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-figaro-cream">
                    ${Number(t.amount).toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right text-figaro-gold">
                    ${Number(t.barberCut ?? t.amount).toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right text-figaro-teal">
                    {Number(t.tip ?? 0) > 0 ? `$${Number(t.tip).toFixed(0)}` : "—"}
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
