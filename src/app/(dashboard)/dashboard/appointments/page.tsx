"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  type: string;
  totalPrice: string | null;
  client: { firstName: string; lastName: string };
  barber: { firstName: string; lastName: string };
  items: Array<{ service: { name: string } }>;
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: "bg-blue-500/20 text-blue-400",
  IN_PROGRESS: "bg-yellow-500/20 text-yellow-400",
  COMPLETED: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-red-500/20 text-red-400",
  NO_SHOW: "bg-gray-500/20 text-gray-400",
};

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0] ?? "";
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().split("T")[0] ?? "";
  const [selectedDate, setSelectedDate] = useState(todayStr);

  function changeDate(d: string) {
    setLoading(true);
    setSelectedDate(d);
  }

  useEffect(() => {
    if (selectedDate) {
      fetch(`/api/appointments?date=${selectedDate}`)
        .then((r) => r.json())
        .then(setAppointments)
        .catch(() => setAppointments([]))
        .finally(() => setLoading(false));
    }
  }, [selectedDate]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-figaro-cream">Appointments</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(todayStr)}
            className={`rounded-sm border px-3 py-2 text-sm font-medium transition-colors ${
              selectedDate === todayStr
                ? "border-figaro-gold bg-figaro-gold/10 text-figaro-gold"
                : "border-figaro-gold/20 text-figaro-cream/60 hover:border-figaro-gold/40 hover:text-figaro-cream"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => changeDate(shiftDate(selectedDate, -1))}
            className="rounded-sm border border-figaro-gold/20 px-3 py-2 text-figaro-cream/60 transition-colors hover:border-figaro-gold/40 hover:text-figaro-cream"
            aria-label="Previous day"
          >
            &larr;
          </button>
          <span className="min-w-[100px] text-center text-sm font-medium text-figaro-cream">
            {formatDisplayDate(selectedDate)}
          </span>
          <button
            onClick={() => changeDate(shiftDate(selectedDate, 1))}
            className="rounded-sm border border-figaro-gold/20 px-3 py-2 text-figaro-cream/60 transition-colors hover:border-figaro-gold/40 hover:text-figaro-cream"
            aria-label="Next day"
          >
            &rarr;
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => changeDate(e.target.value)}
            className="rounded-sm border border-figaro-gold/20 bg-figaro-dark px-3 py-2 text-figaro-cream focus:border-figaro-gold focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-figaro-gold/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-figaro-gold/10 bg-figaro-dark">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Client
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Barber
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Services
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-figaro-gold/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-figaro-cream/40">
                  Loading...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-figaro-cream/40">
                  No appointments for {formatDisplayDate(selectedDate).toLowerCase()}
                </td>
              </tr>
            ) : (
              appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-figaro-gold/5">
                  <td className="px-4 py-3 text-sm text-figaro-cream">
                    {new Date(apt.scheduledAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 text-sm text-figaro-cream">
                    {apt.client.firstName} {apt.client.lastName}
                    {apt.type === "WALK_IN" && (
                      <span className="ml-2 text-xs text-figaro-gold">(Walk-in)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-figaro-cream">{apt.barber.firstName}</td>
                  <td className="px-4 py-3 text-sm text-figaro-cream/70">
                    {apt.items.map((i) => i.service.name).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[apt.status] ?? ""}`}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-figaro-gold">
                    {apt.totalPrice ? formatCurrency(Number(apt.totalPrice)) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
