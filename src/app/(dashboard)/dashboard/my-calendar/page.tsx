"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface CalendarData {
  barber: { id: string; firstName: string };
  view: string;
  date: string;
  appointments: Array<{
    id: string;
    status: string;
    type: string;
    scheduledAt: string;
    client: { firstName: string; lastName: string };
    items: Array<{ service: { name: string; durationMinutes: number } }>;
    payment: { status: string; method: string; amount: string } | null;
  }>;
  schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isOff: boolean;
  }>;
}

export default function MyCalendarPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
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
    let cancelled = false;
    fetch(`/api/barbers/${barberSlug}/calendar?view=day&date=${selectedDate}`)
      .then((r) => r.json())
      .then((d: CalendarData) => {
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [barberSlug, selectedDate]);

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split("T")[0] ?? selectedDate);
  };

  // Get today's schedule
  const dayOfWeek = new Date(selectedDate + "T12:00:00").getDay();
  // Convert JS day (0=Sun) to DB convention (1=Mon, 7=Sun)
  const dbDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
  const todaySchedule = data?.schedules.find((s) => s.dayOfWeek === dbDayOfWeek);

  const statusColors: Record<string, string> = {
    SCHEDULED: "border-l-blue-500 bg-blue-500/5",
    IN_PROGRESS: "border-l-yellow-500 bg-yellow-500/5",
    COMPLETED: "border-l-green-500 bg-green-500/5",
    NO_SHOW: "border-l-red-500 bg-red-500/5",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-figaro-cream">My Calendar</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDate(-1)}
            className="rounded-sm border border-figaro-cream/10 px-3 py-1.5 text-sm text-figaro-cream/60 hover:bg-figaro-cream/5"
          >
            &larr; Prev
          </button>
          <span className="min-w-[140px] text-center text-sm font-medium text-figaro-cream">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString([], {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
          <button
            onClick={() => changeDate(1)}
            className="rounded-sm border border-figaro-cream/10 px-3 py-1.5 text-sm text-figaro-cream/60 hover:bg-figaro-cream/5"
          >
            Next &rarr;
          </button>
          <button
            onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
            className="rounded-sm bg-figaro-teal/20 px-3 py-1.5 text-sm text-figaro-teal hover:bg-figaro-teal/30"
          >
            Today
          </button>
        </div>
      </div>

      {/* Schedule info */}
      {todaySchedule && (
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2">
          {todaySchedule.isOff ? (
            <p className="text-sm text-figaro-cream/40">Day off</p>
          ) : (
            <p className="text-sm text-figaro-cream/60">
              Working hours: <span className="text-figaro-cream">{todaySchedule.startTime}</span>{" "}
              &ndash; <span className="text-figaro-cream">{todaySchedule.endTime}</span>
            </p>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-figaro-teal border-t-transparent" />
        </div>
      ) : !data || data.appointments.length === 0 ? (
        <div className="rounded-sm border border-figaro-cream/5 bg-figaro-dark p-12 text-center">
          <p className="text-figaro-cream/40">No appointments on this day.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.appointments.map((appt) => {
            const totalDuration = appt.items.reduce((sum, i) => sum + i.service.durationMinutes, 0);
            return (
              <div
                key={appt.id}
                className={`rounded-sm border-l-4 border border-figaro-cream/5 p-4 ${statusColors[appt.status] ?? "border-l-figaro-cream/20"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-figaro-cream">
                      {appt.client.firstName} {appt.client.lastName}
                    </p>
                    <p className="mt-0.5 text-xs text-figaro-cream/50">
                      {appt.items.map((i) => i.service.name).join(", ")} &middot; {totalDuration}min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-figaro-cream">
                      {new Date(appt.scheduledAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-xs text-figaro-cream/40">{appt.status}</span>
                      {appt.type === "WALK_IN" && (
                        <span className="rounded bg-figaro-teal/20 px-1.5 py-0.5 text-[10px] text-figaro-teal">
                          Walk-in
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {appt.payment && (
                  <div className="mt-2 flex items-center gap-2 border-t border-figaro-cream/5 pt-2 text-xs text-figaro-cream/40">
                    <span>{appt.payment.method}</span>
                    <span>${Number(appt.payment.amount).toFixed(0)}</span>
                    <span
                      className={
                        appt.payment.status === "COMPLETED" ? "text-green-400" : "text-yellow-400"
                      }
                    >
                      {appt.payment.status}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
