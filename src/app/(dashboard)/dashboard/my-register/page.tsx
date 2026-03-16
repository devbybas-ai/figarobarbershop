"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

interface Appointment {
  id: string;
  status: string;
  type: string;
  scheduledAt: string;
  totalPrice: string | null;
  client: { firstName: string; lastName: string };
  items: Array<{ service: { name: string } }>;
  payment: { status: string; method: string } | null;
}

const PAYMENT_METHODS = ["CASH", "CARD", "ZELLE", "CASHAPP", "VENMO", "SQUARE", "OTHER"] as const;

export default function MyRegisterPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [barberSlug, setBarberSlug] = useState<string | null>(null);
  const [barberType, setBarberType] = useState<string>("COMMISSION");
  const [acceptedMethods, setAcceptedMethods] = useState<string[]>(["CASH", "CARD"]);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("CASH");
  const [tip, setTip] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/barbers")
      .then((r) => r.json())
      .then(
        (
          barbers: Array<{
            userId: string;
            firstName: string;
            barberType: string;
            acceptedPaymentMethods: string[];
          }>,
        ) => {
          const mine = barbers.find((b) => b.userId === session.user.id);
          if (mine) {
            setBarberSlug(mine.firstName.toLowerCase());
            setBarberType(mine.barberType);
            setAcceptedMethods(mine.acceptedPaymentMethods);
          }
        },
      );
  }, [session]);

  const loadAppointments = useCallback(() => {
    if (!barberSlug) return;
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/barbers/${barberSlug}/calendar?view=day&date=${today}`)
      .then((r) => r.json())
      .then((d: { appointments: Appointment[] }) => {
        setAppointments(d.appointments ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [barberSlug]);

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 30000);
    return () => clearInterval(interval);
  }, [loadAppointments]);

  const handleCheckout = async () => {
    if (!checkoutId) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: checkoutId,
          method: selectedMethod,
          tip: tip ? parseFloat(tip) : 0,
        }),
      });
      if (res.ok) {
        setCheckoutId(null);
        setTip("");
        loadAppointments();
      }
    } finally {
      setProcessing(false);
    }
  };

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-blue-500/20 text-blue-400",
    IN_PROGRESS: "bg-yellow-500/20 text-yellow-400",
    COMPLETED: "bg-green-500/20 text-green-400",
  };

  const availableMethods = PAYMENT_METHODS.filter((m) => acceptedMethods.includes(m));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-figaro-teal border-t-transparent" />
      </div>
    );
  }

  const checkoutAppt = appointments.find((a) => a.id === checkoutId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-figaro-cream">My Register</h1>
        <p className="mt-1 text-sm text-figaro-cream/50">
          {barberType === "BOOTH_RENTAL"
            ? "Log your payments directly"
            : "View your queue — payments processed at shop register"}
        </p>
      </div>

      {/* Checkout Modal */}
      {checkoutAppt && (
        <div className="rounded-sm border border-figaro-gold/20 bg-figaro-dark p-6">
          <h2 className="text-lg font-semibold text-figaro-cream">
            Checkout: {checkoutAppt.client.firstName} {checkoutAppt.client.lastName}
          </h2>
          <p className="mt-1 text-sm text-figaro-cream/50">
            {checkoutAppt.items.map((i) => i.service.name).join(", ")}
          </p>
          <p className="mt-2 text-2xl font-bold text-figaro-gold">
            ${Number(checkoutAppt.totalPrice ?? 0).toFixed(2)}
          </p>

          <div className="mt-4">
            <label className="text-xs font-medium text-figaro-cream/60">Payment Method</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => setSelectedMethod(method)}
                  className={`rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
                    selectedMethod === method
                      ? "bg-figaro-gold text-figaro-dark"
                      : "border border-figaro-cream/10 text-figaro-cream/60 hover:bg-figaro-cream/5"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-figaro-cream/60">Tip ($)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              placeholder="0"
              className="mt-1 w-32 rounded-sm border border-figaro-cream/10 bg-figaro-black px-3 py-2 text-figaro-cream placeholder:text-figaro-cream/30"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="rounded-sm bg-figaro-gold px-6 py-2.5 font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
            >
              {processing ? "Processing..." : "Complete Payment"}
            </button>
            <button
              onClick={() => {
                setCheckoutId(null);
                setTip("");
              }}
              className="rounded-sm border border-figaro-cream/10 px-6 py-2.5 text-figaro-cream/60 hover:bg-figaro-cream/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Queue */}
      <div className="space-y-2">
        {appointments.length === 0 ? (
          <div className="rounded-sm border border-figaro-cream/5 bg-figaro-dark p-12 text-center">
            <p className="text-figaro-cream/40">No appointments today.</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between rounded-sm border border-figaro-cream/5 bg-figaro-dark px-4 py-3"
            >
              <div>
                <p className="font-medium text-figaro-cream">
                  {appt.client.firstName} {appt.client.lastName}
                </p>
                <p className="text-xs text-figaro-cream/50">
                  {appt.items.map((i) => i.service.name).join(", ")} &middot;{" "}
                  {new Date(appt.scheduledAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-figaro-cream/60">
                  ${Number(appt.totalPrice ?? 0).toFixed(0)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[appt.status] ?? ""}`}
                >
                  {appt.status}
                </span>
                {!appt.payment &&
                  (appt.status === "IN_PROGRESS" || appt.status === "COMPLETED") &&
                  (barberType === "BOOTH_RENTAL" || barberType === "COMMISSION") && (
                    <button
                      onClick={() => {
                        setCheckoutId(appt.id);
                        setSelectedMethod(availableMethods[0] ?? "CASH");
                      }}
                      className="rounded-sm bg-figaro-teal px-3 py-1 text-xs font-medium text-white hover:bg-figaro-teal-dark"
                    >
                      Checkout
                    </button>
                  )}
                {appt.payment?.status === "COMPLETED" && (
                  <span className="text-xs text-green-400">Paid ({appt.payment.method})</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
