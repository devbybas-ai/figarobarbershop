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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0] ?? "");

  useEffect(() => {
    if (selectedDate) {
      fetch(`/api/appointments?date=${selectedDate}`)
        .then((r) => r.json())
        .then(setAppointments)
        .catch(() => setAppointments([]));
    }
  }, [selectedDate]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-figaro-cream">Appointments</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-sm border border-figaro-gold/20 bg-figaro-dark px-3 py-2 text-figaro-cream focus:border-figaro-gold focus:outline-none"
        />
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
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-figaro-cream/40">
                  No appointments for this date
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
