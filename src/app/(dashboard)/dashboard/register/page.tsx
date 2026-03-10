"use client";

import { useEffect, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatCurrency, formatTime } from "@/lib/utils";

interface Barber {
  id: string;
  firstName: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  durationMinutes: number;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  intakeCompleted: boolean;
  createdAt: string;
}

interface AppointmentClient {
  firstName: string;
  lastName: string;
}

interface AppointmentBarber {
  firstName: string;
}

interface AppointmentItem {
  service: { name: string };
}

interface AppointmentPayment {
  status: string;
  method: string;
}

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  type: string;
  totalPrice: string | null;
  client: AppointmentClient;
  barber: AppointmentBarber;
  items: AppointmentItem[];
  payment: AppointmentPayment | null;
}

type RegisterView = "queue" | "walkin" | "checkout" | "qr";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SCHEDULED: { label: "Waiting", color: "bg-blue-500/20 text-blue-400" },
  IN_PROGRESS: { label: "In Chair", color: "bg-yellow-500/20 text-yellow-400" },
  COMPLETED: { label: "Done", color: "bg-green-500/20 text-green-400" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500/20 text-red-400" },
  NO_SHOW: { label: "No Show", color: "bg-gray-500/20 text-gray-400" },
};

export default function RegisterPage() {
  const [view, setView] = useState<RegisterView>("queue");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Walk-in form state
  const [selectedClientId, setSelectedClientId] = useState("");
  const [walkinFirstName, setWalkinFirstName] = useState("");
  const [walkinLastName, setWalkinLastName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [walkinError, setWalkinError] = useState("");
  const [walkinSubmitting, setWalkinSubmitting] = useState(false);

  // Checkout state
  const [checkoutAppointment, setCheckoutAppointment] = useState<Appointment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const intakeUrl = typeof window !== "undefined" ? `${window.location.origin}/intake` : "/intake";

  const loadTodayQueue = useCallback(async () => {
    try {
      const res = await fetch(`/api/appointments?date=${todayStr}`);
      if (res.ok) {
        const data: Appointment[] = await res.json();
        setAppointments(data);
      }
    } catch {
      // silently fail
    }
  }, [todayStr]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [barbersRes, servicesRes, clientsRes] = await Promise.all([
        fetch("/api/barbers"),
        fetch("/api/services"),
        fetch("/api/clients?recent=true"),
      ]);

      if (barbersRes.ok) setBarbers(await barbersRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (clientsRes.ok) {
        const clients: Client[] = await clientsRes.json();
        // Show clients created in the last 24 hours first (recent intakes)
        setRecentClients(clients);
      }

      await loadTodayQueue();
      setLoading(false);
    }

    loadData();
  }, [loadTodayQueue]);

  // Auto-refresh queue every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadTodayQueue, 30000);
    return () => clearInterval(interval);
  }, [loadTodayQueue]);

  function handleClientSelect(clientId: string) {
    setSelectedClientId(clientId);
    if (clientId) {
      const client = recentClients.find((c) => c.id === clientId);
      if (client) {
        setWalkinFirstName(client.firstName);
        setWalkinLastName(client.lastName);
        setWalkinPhone(client.phone ?? "");
      }
    } else {
      setWalkinFirstName("");
      setWalkinLastName("");
      setWalkinPhone("");
    }
  }

  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    );
  }

  async function handleWalkinSubmit(e: React.FormEvent) {
    e.preventDefault();
    setWalkinError("");
    setWalkinSubmitting(true);

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientFirstName: walkinFirstName,
          clientLastName: walkinLastName,
          clientPhone: walkinPhone || undefined,
          barberId: selectedBarberId,
          serviceIds: selectedServiceIds,
          scheduledAt: new Date().toISOString(),
          type: "WALK_IN",
        }),
      });

      if (res.ok) {
        // Reset form and go back to queue
        setWalkinFirstName("");
        setWalkinLastName("");
        setWalkinPhone("");
        setSelectedClientId("");
        setSelectedBarberId("");
        setSelectedServiceIds([]);
        await loadTodayQueue();
        setView("queue");
      } else {
        const err = await res.json();
        setWalkinError(err.error ?? "Failed to create appointment");
      }
    } catch {
      setWalkinError("Something went wrong");
    } finally {
      setWalkinSubmitting(false);
    }
  }

  async function updateAppointmentStatus(appointmentId: string, status: string) {
    await fetch(`/api/appointments/${appointmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await loadTodayQueue();
  }

  async function handleCheckout() {
    if (!checkoutAppointment) return;
    setPaymentProcessing(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: checkoutAppointment.id,
          method: paymentMethod,
        }),
      });

      if (res.ok) {
        setCheckoutAppointment(null);
        await loadTodayQueue();
        setView("queue");
      }
    } catch {
      // silently fail
    } finally {
      setPaymentProcessing(false);
    }
  }

  function openCheckout(apt: Appointment) {
    setCheckoutAppointment(apt);
    setPaymentMethod("CASH");
    setView("checkout");
  }

  const selectedServiceTotal = services
    .filter((s) => selectedServiceIds.includes(s.id))
    .reduce((sum, s) => sum + Number(s.price), 0);

  // Categorize today's appointments
  const waiting = appointments.filter((a) => a.status === "SCHEDULED");
  const inChair = appointments.filter((a) => a.status === "IN_PROGRESS");
  const completed = appointments.filter((a) => a.status === "COMPLETED");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-figaro-cream/40">Loading...</div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-figaro-gold/10 pb-4">
        <h2 className="text-2xl font-bold text-figaro-cream">Register</h2>
        <div className="flex gap-2">
          {(["queue", "walkin", "qr"] as RegisterView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
                view === v
                  ? "border-figaro-gold bg-figaro-gold/10 text-figaro-gold"
                  : "border-figaro-gold/20 text-figaro-cream/60 hover:border-figaro-gold/40 hover:text-figaro-cream"
              }`}
            >
              {v === "queue" && "Today's Queue"}
              {v === "walkin" && "+ Walk-In"}
              {v === "qr" && "QR Code"}
            </button>
          ))}
        </div>
      </div>

      {/* Queue View */}
      {view === "queue" && (
        <div className="mt-6 flex-1 space-y-6">
          {/* Summary Chips */}
          <div className="flex gap-4">
            <div className="rounded-sm border border-blue-500/20 bg-blue-500/5 px-4 py-2">
              <span className="text-xs text-blue-400">Waiting</span>
              <p className="text-xl font-bold text-blue-400">{waiting.length}</p>
            </div>
            <div className="rounded-sm border border-yellow-500/20 bg-yellow-500/5 px-4 py-2">
              <span className="text-xs text-yellow-400">In Chair</span>
              <p className="text-xl font-bold text-yellow-400">{inChair.length}</p>
            </div>
            <div className="rounded-sm border border-green-500/20 bg-green-500/5 px-4 py-2">
              <span className="text-xs text-green-400">Completed</span>
              <p className="text-xl font-bold text-green-400">{completed.length}</p>
            </div>
          </div>

          {/* Appointment List */}
          {appointments.length === 0 ? (
            <div className="rounded-sm border border-figaro-gold/10 p-8 text-center text-figaro-cream/40">
              No appointments today yet. Add a walk-in or wait for bookings.
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map((apt) => {
                const status = STATUS_LABELS[apt.status];
                const isPaid = apt.payment?.status === "COMPLETED";
                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="min-w-[60px] text-sm text-figaro-cream/50">
                        {formatTime(new Date(apt.scheduledAt))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-figaro-cream">
                          {apt.client.firstName} {apt.client.lastName}
                          {apt.type === "WALK_IN" && (
                            <span className="ml-2 text-xs text-figaro-gold">(Walk-in)</span>
                          )}
                        </p>
                        <p className="text-xs text-figaro-cream/40">
                          with {apt.barber.firstName} &middot;{" "}
                          {apt.items.map((i) => i.service.name).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-figaro-gold">
                        {apt.totalPrice ? formatCurrency(Number(apt.totalPrice)) : "—"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status?.color ?? ""}`}
                      >
                        {status?.label ?? apt.status}
                      </span>
                      {isPaid && (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                          Paid
                        </span>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        {apt.status === "SCHEDULED" && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, "IN_PROGRESS")}
                            className="rounded-sm bg-yellow-500/20 px-3 py-1.5 text-xs font-medium text-yellow-400 transition-colors hover:bg-yellow-500/30"
                          >
                            Start
                          </button>
                        )}
                        {apt.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, "COMPLETED")}
                            className="rounded-sm bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/30"
                          >
                            Complete
                          </button>
                        )}
                        {apt.status === "COMPLETED" && !isPaid && (
                          <button
                            onClick={() => openCheckout(apt)}
                            className="rounded-sm bg-figaro-gold/20 px-3 py-1.5 text-xs font-medium text-figaro-gold transition-colors hover:bg-figaro-gold/30"
                          >
                            Checkout
                          </button>
                        )}
                        {apt.status === "SCHEDULED" && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, "NO_SHOW")}
                            className="rounded-sm bg-gray-500/10 px-3 py-1.5 text-xs font-medium text-figaro-cream/30 transition-colors hover:bg-gray-500/20 hover:text-figaro-cream/50"
                          >
                            No Show
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Walk-In View */}
      {view === "walkin" && (
        <form onSubmit={handleWalkinSubmit} className="mt-6 max-w-2xl space-y-5">
          {walkinError && (
            <div className="rounded-sm border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {walkinError}
            </div>
          )}

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-figaro-cream/70">
              Select Recent Client (from intake)
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-dark px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
            >
              <option value="">-- New client or select existing --</option>
              {recentClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                  {c.phone ? ` (${c.phone})` : ""}
                  {c.intakeCompleted ? " - Intake done" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-figaro-cream/70">First Name *</label>
              <input
                type="text"
                required
                value={walkinFirstName}
                onChange={(e) => setWalkinFirstName(e.target.value)}
                className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-dark px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-figaro-cream/70">Last Name *</label>
              <input
                type="text"
                required
                value={walkinLastName}
                onChange={(e) => setWalkinLastName(e.target.value)}
                className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-dark px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-figaro-cream/70">Phone *</label>
            <input
              type="tel"
              required
              value={walkinPhone}
              onChange={(e) => setWalkinPhone(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-dark px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
            />
          </div>

          {/* Barber Selection */}
          <div>
            <label className="block text-sm font-medium text-figaro-cream/70">Barber *</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {barbers.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBarberId(b.id)}
                  className={`rounded-sm border px-4 py-2 text-sm font-medium transition-colors ${
                    selectedBarberId === b.id
                      ? "border-figaro-gold bg-figaro-gold/20 text-figaro-gold"
                      : "border-figaro-gold/20 text-figaro-cream/60 hover:border-figaro-gold/40"
                  }`}
                >
                  {b.firstName}
                </button>
              ))}
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-figaro-cream/70">Services *</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleService(s.id)}
                  className={`rounded-sm border px-3 py-2 text-sm transition-colors ${
                    selectedServiceIds.includes(s.id)
                      ? "border-figaro-teal bg-figaro-teal/20 text-figaro-teal"
                      : "border-figaro-gold/20 text-figaro-cream/60 hover:border-figaro-gold/40"
                  }`}
                >
                  {s.name} — {formatCurrency(Number(s.price))}
                </button>
              ))}
            </div>
            {selectedServiceIds.length > 0 && (
              <p className="mt-2 text-sm font-medium text-figaro-gold">
                Total: {formatCurrency(selectedServiceTotal)}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              walkinSubmitting ||
              !walkinFirstName ||
              !walkinLastName ||
              !walkinPhone ||
              !selectedBarberId ||
              selectedServiceIds.length === 0
            }
            className="w-full rounded-sm bg-figaro-gold px-4 py-3 font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
          >
            {walkinSubmitting ? "Adding..." : "Add Walk-In to Queue"}
          </button>
        </form>
      )}

      {/* Checkout View */}
      {view === "checkout" && checkoutAppointment && (
        <div className="mt-6 max-w-md space-y-6">
          <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
            <h3 className="text-lg font-semibold text-figaro-cream">Checkout</h3>

            <div className="mt-4 space-y-2 border-b border-figaro-gold/10 pb-4">
              <p className="text-sm text-figaro-cream">
                {checkoutAppointment.client.firstName} {checkoutAppointment.client.lastName}
              </p>
              <p className="text-xs text-figaro-cream/40">
                with {checkoutAppointment.barber.firstName} &middot;{" "}
                {checkoutAppointment.items.map((i) => i.service.name).join(", ")}
              </p>
            </div>

            <div className="mt-4">
              <p className="text-2xl font-bold text-figaro-gold">
                {checkoutAppointment.totalPrice
                  ? formatCurrency(Number(checkoutAppointment.totalPrice))
                  : "$0.00"}
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-figaro-cream/70">
                Payment Method
              </label>
              <div className="mt-2 flex gap-3">
                {(["CASH", "CARD"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 rounded-sm border py-3 text-sm font-medium transition-colors ${
                      paymentMethod === method
                        ? "border-figaro-gold bg-figaro-gold/20 text-figaro-gold"
                        : "border-figaro-gold/20 text-figaro-cream/60 hover:border-figaro-gold/40"
                    }`}
                  >
                    {method === "CASH" ? "Cash" : "Card"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={paymentProcessing}
              className="mt-6 w-full rounded-sm bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {paymentProcessing ? "Processing..." : "Complete Payment"}
            </button>

            <button
              onClick={() => {
                setCheckoutAppointment(null);
                setView("queue");
              }}
              className="mt-2 w-full rounded-sm px-4 py-2 text-sm text-figaro-cream/40 transition-colors hover:text-figaro-cream"
            >
              Back to Queue
            </button>
          </div>
        </div>
      )}

      {/* QR Code View */}
      {view === "qr" && (
        <div className="mt-6 flex flex-col items-center space-y-6">
          <div className="rounded-sm border border-figaro-gold/10 bg-white p-8">
            <QRCodeSVG value={intakeUrl} size={250} level="H" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-figaro-cream">Scan to Fill Out Intake Form</p>
            <p className="mt-1 text-sm text-figaro-cream/40">{intakeUrl}</p>
          </div>
          <p className="max-w-sm text-center text-xs text-figaro-cream/30">
            Display this QR code at the front desk or print it out. Clients scan with their phone
            camera to open the intake form.
          </p>
        </div>
      )}
    </div>
  );
}
