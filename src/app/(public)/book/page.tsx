"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

interface Barber {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  durationMinutes: number;
  price: string;
}

export default function BookPage() {
  const [step, setStep] = useState(1);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/barbers")
      .then((r) => r.json())
      .then(setBarbers)
      .catch(() => setBarbers([]));
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  const totalPrice = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + Number(s.price), 0);

  const totalDuration = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientFirstName: firstName,
          clientLastName: lastName,
          clientEmail: email || undefined,
          clientPhone: phone || undefined,
          barberId: selectedBarber,
          serviceIds: selectedServices,
          scheduledAt,
          type: "BOOKED",
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-figaro-cream">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-figaro-teal/20 text-figaro-teal">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-figaro-black">You&apos;re Booked!</h2>
          <p className="mt-2 text-figaro-black/60">We look forward to seeing you at Figaro.</p>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="relative flex h-48 items-center justify-center overflow-hidden bg-figaro-dark sm:h-56">
        <img
          src="/images/shop-chairs.jpg"
          alt="Figaro Barbershop chair"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-figaro-dark/40 to-figaro-dark/80" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-figaro-teal via-figaro-gold to-figaro-teal" />
        <div className="relative z-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-figaro-cream sm:text-5xl">
            Book Your Appointment
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-figaro-teal" />
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-figaro-teal">
              Appointments
            </p>
            <div className="h-px w-8 bg-figaro-teal" />
          </div>
        </div>
      </section>

      <section className="bg-figaro-cream py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mt-8 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${
                  s <= step
                    ? s === step
                      ? "bg-figaro-teal"
                      : "bg-figaro-gold"
                    : "bg-figaro-black/10"
                }`}
              />
            ))}
          </div>

          <div className="mt-10">
            {/* Step 1: Select Barber & Services */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-lg font-semibold text-figaro-black">Choose Your Barber</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {barbers.map((barber) => (
                    <button
                      key={barber.id}
                      type="button"
                      onClick={() => setSelectedBarber(barber.id)}
                      className={`rounded-sm border p-4 text-left transition-colors ${
                        selectedBarber === barber.id
                          ? "border-figaro-teal bg-figaro-teal/10 shadow-md shadow-figaro-teal/5"
                          : "border-figaro-black/10 bg-white hover:border-figaro-gold/50"
                      }`}
                    >
                      <p className="font-semibold text-figaro-black">
                        {barber.firstName} {barber.lastName}
                      </p>
                    </button>
                  ))}
                </div>

                <h2 className="mt-8 text-lg font-semibold text-figaro-black">Select Services</h2>
                <div className="mt-4 space-y-2">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`flex w-full items-center justify-between rounded-sm border p-4 text-left transition-colors ${
                        selectedServices.includes(service.id)
                          ? "border-figaro-gold bg-figaro-gold/10"
                          : "border-figaro-black/10 bg-white hover:border-figaro-gold/50"
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-figaro-black">{service.name}</p>
                        <p className="text-sm text-figaro-black/50">
                          {service.durationMinutes} min
                        </p>
                      </div>
                      <p className="text-lg font-bold text-figaro-gold">${Number(service.price)}</p>
                    </button>
                  ))}
                </div>

                {selectedServices.length > 0 && (
                  <div className="mt-4 rounded-sm bg-figaro-dark p-4 text-figaro-cream">
                    <div className="flex justify-between">
                      <span>Total: {totalDuration} min</span>
                      <span className="font-bold text-figaro-gold">${totalPrice}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!selectedBarber || selectedServices.length === 0}
                  onClick={() => setStep(2)}
                  className="mt-6 w-full rounded-sm bg-figaro-gold px-4 py-3 font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
                >
                  Next: Pick Date &amp; Time
                </button>
              </motion.div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-lg font-semibold text-figaro-black">Pick Date &amp; Time</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-figaro-black">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-teal focus:outline-none focus:ring-1 focus:ring-figaro-teal"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-figaro-black">
                      Time
                    </label>
                    <select
                      id="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-teal focus:outline-none focus:ring-1 focus:ring-figaro-teal"
                    >
                      <option value="">Select time</option>
                      {Array.from({ length: 20 }, (_, i) => {
                        const hour = Math.floor(i / 2) + 9;
                        const min = i % 2 === 0 ? "00" : "30";
                        if (hour >= 19) return null;
                        const label = `${hour > 12 ? hour - 12 : hour}:${min} ${hour >= 12 ? "PM" : "AM"}`;
                        const val = `${hour.toString().padStart(2, "0")}:${min}`;
                        return (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-sm border border-figaro-black/20 px-4 py-3 font-semibold text-figaro-black transition-colors hover:bg-figaro-black/5"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!date || !time}
                    onClick={() => setStep(3)}
                    className="flex-1 rounded-sm bg-figaro-gold px-4 py-3 font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
                  >
                    Next: Your Info
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Contact Info */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-lg font-semibold text-figaro-black">Your Information</h2>
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-figaro-black"
                      >
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-teal focus:outline-none focus:ring-1 focus:ring-figaro-teal"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-figaro-black"
                      >
                        Last Name *
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-teal focus:outline-none focus:ring-1 focus:ring-figaro-teal"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-figaro-black">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-teal focus:outline-none focus:ring-1 focus:ring-figaro-teal"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-figaro-black">
                      Phone
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-teal focus:outline-none focus:ring-1 focus:ring-figaro-teal"
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-sm border border-figaro-black/20 px-4 py-3 font-semibold text-figaro-black transition-colors hover:bg-figaro-black/5"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!firstName || !lastName || submitting}
                    onClick={handleSubmit}
                    className="flex-1 rounded-sm bg-figaro-gold px-4 py-3 font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
                  >
                    {submitting ? "Booking..." : `Book Now - $${totalPrice}`}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
