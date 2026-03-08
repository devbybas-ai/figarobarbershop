"use client";

import { useEffect, useRef, useState } from "react";
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

type TimeSlot = { time: string; label: string };

const STEPS = ["Services", "Professional", "Time", "Confirm"] as const;

function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  }
  return `${minutes} min`;
}

export default function BookPage() {
  const [step, setStep] = useState(0);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [date, setDate] = useState("");
  const [datePageStart, setDatePageStart] = useState(0);
  const [time, setTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/barbers")
      .then((r) => r.json())
      .then((data: Barber[]) => setBarbers(data))
      .catch(() => setBarbers([]));
    fetch("/api/services")
      .then((r) => r.json())
      .then((data: Service[]) => {
        setServices(data);
        const cats = [...new Set(data.map((s) => s.category))];
        if (cats.length > 0 && cats[0]) setActiveCategory(cats[0]);
      })
      .catch(() => setServices([]));
  }, []);

  // Fetch available time slots when date or barber changes
  useEffect(() => {
    if (!date || !selectedBarber) {
      setAvailableSlots([]);
      return;
    }
    setLoadingSlots(true);
    setTime("");
    fetch(
      `/api/appointments/availability?date=${date}&barberId=${selectedBarber}&duration=${totalDuration}`,
    )
      .then((r) => r.json())
      .then((data: { availableSlots: string[] }) => {
        const slots: TimeSlot[] = (data.availableSlots ?? []).map((s: string) => {
          const [h, m] = s.split(":");
          const hour = parseInt(h ?? "0", 10);
          const minute = m ?? "00";
          const ampm = hour >= 12 ? "PM" : "AM";
          const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
          return { time: s, label: `${h12}:${minute} ${ampm}` };
        });
        setAvailableSlots(slots);
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, selectedBarber]);

  const selectedServiceObjects = services.filter((s) => selectedServices.includes(s.id));
  const totalPrice = selectedServiceObjects.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = selectedServiceObjects.reduce((sum, s) => sum + s.durationMinutes, 0);
  const categories = [...new Set(services.map((s) => s.category))];
  const selectedBarberObj = barbers.find((b) => b.id === selectedBarber);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Auto-switch active category tab when scrolling
  const isManualScroll = useRef(false);
  useEffect(() => {
    if (step !== 0 || categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScroll.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cat = entry.target.id.replace("cat-", "");
            setActiveCategory(cat);
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    );

    const timer = setTimeout(() => {
      for (const cat of categories) {
        const el = document.getElementById(`cat-${cat}`);
        if (el) observer.observe(el);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [step, categories]);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  const CATEGORY_LABELS: Record<string, string> = {
    HAIRCUT: "Haircut",
    BEARD: "Beard",
    SHAVE: "Shaves",
    COMBO: "Combos",
    OTHER: "Other",
  };

  function canContinue(): boolean {
    if (step === 0) return selectedServices.length > 0;
    if (step === 1) return !!selectedBarber;
    if (step === 2) return !!date && !!time;
    if (step === 3) return !!firstName && !!lastName;
    return false;
  }

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

  // Generate next 14 days for date picker
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      value: d.toISOString().split("T")[0] ?? "",
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  });

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
          <div className="mt-6 rounded-sm border border-figaro-black/10 bg-white p-6 text-left">
            <p className="text-sm text-figaro-black/50">Your appointment</p>
            <p className="mt-1 font-semibold text-figaro-black">
              {selectedBarberObj?.firstName} &middot;{" "}
              {new Date(`${date}T${time}:00`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              at{" "}
              {(() => {
                const [h, m] = time.split(":");
                const hour = parseInt(h ?? "0", 10);
                const ampm = hour >= 12 ? "PM" : "AM";
                const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                return `${h12}:${m} ${ampm}`;
              })()}
            </p>
            <div className="mt-3 space-y-1">
              {selectedServiceObjects.map((s) => (
                <p key={s.id} className="text-sm text-figaro-black/70">
                  {s.name} — ${Number(s.price)}
                </p>
              ))}
            </div>
            <div className="mt-3 border-t border-figaro-black/10 pt-3">
              <p className="font-semibold text-figaro-black">Total: ${totalPrice}</p>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-figaro-cream">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Steps */}
        <nav className="flex items-center gap-2 text-sm" aria-label="Booking steps">
          {STEPS.map((label, i) => (
            <span key={label} className="flex items-center gap-2">
              {i > 0 && (
                <svg
                  className="h-4 w-4 text-figaro-black/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              )}
              <button
                type="button"
                onClick={() => {
                  if (i < step) {
                    setStep(i);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                disabled={i > step}
                className={`transition-colors ${
                  i === step
                    ? "font-semibold text-figaro-black"
                    : i < step
                      ? "cursor-pointer text-figaro-black/50 underline decoration-figaro-black/20 underline-offset-2 hover:text-figaro-black"
                      : "cursor-default text-figaro-black/30"
                }`}
              >
                {label}
              </button>
            </span>
          ))}
        </nav>

        {/* Mobile Sticky Top Cart Bar */}
        <div className="sticky top-[3.6rem] z-30 mt-6 lg:hidden">
          {/* Top bar */}
          <div className="-mx-4 border-b border-figaro-black/10 bg-white px-5 pb-4 pt-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setMobileCartOpen(!mobileCartOpen)}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-figaro-dark text-sm font-bold text-figaro-cream">
                  {selectedServices.length}
                </div>
                <div className="flex min-w-0 flex-col justify-center text-left">
                  <p className="text-sm font-semibold leading-tight text-figaro-black">
                    {selectedServices.length === 0
                      ? "No services selected"
                      : `${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""}`}
                  </p>
                  {totalPrice > 0 && (
                    <p className="mt-0.5 text-xs leading-tight text-figaro-black/50">
                      ${totalPrice} &middot; {formatDuration(totalDuration)}
                    </p>
                  )}
                </div>
                {selectedServices.length > 0 && (
                  <svg
                    className={`h-5 w-5 flex-shrink-0 text-figaro-black/30 transition-transform ${mobileCartOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
              </button>
              {canContinue() && (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 3) handleSubmit();
                    else {
                      setStep(step + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="flex-shrink-0 rounded-full bg-figaro-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-figaro-black"
                >
                  {submitting
                    ? "Booking..."
                    : step === 3
                      ? `Book — $${totalPrice}`
                      : "Continue"}
                </button>
              )}
            </div>
          </div>

          {/* Expandable cart details (drops down below the bar) */}
          {mobileCartOpen && selectedServiceObjects.length > 0 && (
            <div className="mx-4 mt-2 rounded-xl border border-figaro-black/10 bg-white px-5 py-4 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-figaro-black">Your Services</p>
                <p className="text-sm font-semibold text-figaro-black">${totalPrice}</p>
              </div>
              <div className="space-y-3">
                {selectedServiceObjects.map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-figaro-black">{s.name}</p>
                      <p className="text-xs text-figaro-black/40">{formatDuration(s.durationMinutes)}</p>
                    </div>
                    <p className="text-sm text-figaro-black/60">${Number(s.price)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-8 lg:mt-8 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            {/* Step 0: Services */}
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-figaro-black">Services</h1>

                {/* Category Filter Tabs (scroll to section) */}
                <div className="sticky top-[8.1rem] z-10 -mx-4 bg-figaro-cream px-4 pb-4 pt-5 sm:top-16 sm:-mx-0 sm:px-0 sm:pt-4 lg:top-16">
                  <div className="flex gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          isManualScroll.current = true;
                          setActiveCategory(cat);
                          document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                          setTimeout(() => { isManualScroll.current = false; }, 800);
                        }}
                        className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                          activeCategory === cat
                            ? "bg-figaro-black text-white"
                            : "bg-figaro-black/5 text-figaro-black hover:bg-figaro-black/10"
                        }`}
                      >
                        {CATEGORY_LABELS[cat] ?? cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Service Cards — All Categories */}
                {categories.map((cat) => (
                    <div key={cat} id={`cat-${cat}`} className="mt-10 scroll-mt-[12rem] sm:scroll-mt-28">
                      <h2 className="text-xl font-bold text-figaro-black">
                        {CATEGORY_LABELS[cat] ?? cat}
                      </h2>
                      <div className="mt-5 space-y-5">
                        {services
                          .filter((s) => s.category === cat)
                          .map((service) => {
                            const isSelected = selectedServices.includes(service.id);
                            return (
                              <div
                                key={service.id}
                                className={`flex items-start justify-between rounded-lg border bg-white p-6 transition-all ${
                                  isSelected
                                    ? "border-figaro-gold shadow-sm"
                                    : "border-figaro-black/10 hover:border-figaro-black/20"
                                }`}
                              >
                                <div className="flex-1 pr-4">
                                  <h3 className="font-semibold text-figaro-black">{service.name}</h3>
                                  <p className="mt-0.5 text-sm text-figaro-black/50">
                                    {formatDuration(service.durationMinutes)}
                                  </p>
                                  {service.description && (
                                    <p className="mt-1.5 line-clamp-2 text-sm text-figaro-black/60">
                                      {service.description}
                                    </p>
                                  )}
                                  <p className="mt-2.5 font-semibold text-figaro-black">
                                    ${Number(service.price)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleService(service.id)}
                                  className={`mt-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                                    isSelected
                                      ? "border-figaro-gold bg-figaro-gold text-white"
                                      : "border-figaro-black/20 text-figaro-black/40 hover:border-figaro-black/40"
                                  }`}
                                  aria-label={isSelected ? `Remove ${service.name}` : `Add ${service.name}`}
                                >
                                  {isSelected ? (
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2.5}
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m4.5 12.75 6 6 9-13.5"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </motion.div>
            )}

            {/* Step 1: Professional */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-figaro-black">Professional</h1>
                <p className="mt-2 text-figaro-black/50">Choose your barber</p>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {barbers.map((barber) => (
                    <button
                      key={barber.id}
                      type="button"
                      onClick={() => setSelectedBarber(barber.id)}
                      className={`flex items-center gap-4 rounded-lg border bg-white p-5 text-left transition-all ${
                        selectedBarber === barber.id
                          ? "border-figaro-gold shadow-sm"
                          : "border-figaro-black/10 hover:border-figaro-black/20"
                      }`}
                    >
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-figaro-dark text-lg font-bold text-figaro-cream">
                        {barber.firstName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-figaro-black">{barber.firstName}</p>
                        {barber.bio && (
                          <p className="mt-0.5 line-clamp-1 text-sm text-figaro-black/50">
                            {barber.bio}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Time */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-figaro-black">Time</h1>
                <p className="mt-2 text-figaro-black/50">
                  Pick a date and time with {selectedBarberObj?.firstName}
                </p>

                {/* Date Picker */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-figaro-black/70">Date</h2>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setDatePageStart(Math.max(0, datePageStart - 7))}
                        disabled={datePageStart === 0}
                        className={`rounded-lg border p-2 transition-all ${
                          datePageStart === 0
                            ? "cursor-not-allowed border-figaro-black/5 text-figaro-black/20"
                            : "border-figaro-black/10 text-figaro-black/60 hover:border-figaro-black/20 hover:text-figaro-black"
                        }`}
                        aria-label="Previous week"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDatePageStart(Math.min(dateOptions.length - 7, datePageStart + 7))}
                        disabled={datePageStart + 7 >= dateOptions.length}
                        className={`rounded-lg border p-2 transition-all ${
                          datePageStart + 7 >= dateOptions.length
                            ? "cursor-not-allowed border-figaro-black/5 text-figaro-black/20"
                            : "border-figaro-black/10 text-figaro-black/60 hover:border-figaro-black/20 hover:text-figaro-black"
                        }`}
                        aria-label="Next week"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-7 gap-2">
                    {dateOptions.slice(datePageStart, datePageStart + 7).map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDate(d.value)}
                        className={`flex flex-col items-center rounded-lg border px-2 py-3 transition-all ${
                          date === d.value
                            ? "border-figaro-gold bg-figaro-gold text-figaro-dark"
                            : "border-figaro-black/10 bg-white text-figaro-black hover:border-figaro-black/20"
                        }`}
                      >
                        <span className="text-xs font-medium uppercase">{d.dayName}</span>
                        <span className="mt-0.5 text-lg font-bold">{d.dayNum}</span>
                        <span className="text-xs">{d.month}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                {date && (
                  <div className="mt-8">
                    <h2 className="text-sm font-medium text-figaro-black/70">Available times</h2>
                    {loadingSlots ? (
                      <p className="mt-4 text-sm text-figaro-black/40">Loading available times...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="mt-4 text-sm text-figaro-black/40">
                        No available slots for this date. Try another day.
                      </p>
                    ) : (
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setTime(slot.time)}
                            className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                              time === slot.time
                                ? "border-figaro-gold bg-figaro-gold text-figaro-dark"
                                : "border-figaro-black/10 bg-white text-figaro-black hover:border-figaro-black/20"
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-figaro-black">Confirm Booking</h1>
                <p className="mt-2 text-figaro-black/50">Enter your details to complete your booking</p>

                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                        className="mt-1 block w-full rounded-lg border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
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
                        className="mt-1 block w-full rounded-lg border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
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
                      className="mt-1 block w-full rounded-lg border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
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
                      className="mt-1 block w-full rounded-lg border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar (desktop only — mobile uses compact cart bar above) */}
          <div className="hidden w-full lg:block lg:w-80">
            <div className="sticky top-24 rounded-lg border border-figaro-black/10 bg-white p-6">
              {/* Shop Info */}
              <div className="flex items-center gap-3">
                <img
                  src="/images/figaro-logo.avif"
                  alt="Figaro Barbershop"
                  className="h-14 w-14 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-figaro-black">Figaro Barbershop Leucadia</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-figaro-black">4.9</span>
                    <div className="flex text-figaro-gold">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-figaro-black/40">(36)</span>
                  </div>
                  <p className="mt-0.5 text-xs text-figaro-black/40">
                    114 Leucadia Boulevard, Encinitas
                  </p>
                </div>
              </div>

              {/* Selected Items */}
              <div className="mt-5 border-t border-figaro-black/10 pt-5">
                {selectedServiceObjects.length === 0 ? (
                  <p className="text-sm text-figaro-black/40">No services selected</p>
                ) : (
                  <div className="space-y-3">
                    {selectedServiceObjects.map((s) => (
                      <div key={s.id} className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-figaro-black">{s.name}</p>
                          <p className="text-xs text-figaro-black/40">
                            {formatDuration(s.durationMinutes)}
                            {selectedBarberObj ? ` with ${selectedBarberObj.firstName}` : ""}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-figaro-black">
                          ${Number(s.price)}
                        </p>
                      </div>
                    ))}
                    {date && time && (
                      <div className="rounded-md bg-figaro-cream/50 px-3 py-2">
                        <p className="text-xs font-medium text-figaro-black/60">
                          {new Date(`${date}T${time}:00`).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          at{" "}
                          {(() => {
                            const [h, m] = time.split(":");
                            const hour = parseInt(h ?? "0", 10);
                            const ampm = hour >= 12 ? "PM" : "AM";
                            const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                            return `${h12}:${m} ${ampm}`;
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="mt-5 flex items-center justify-between border-t border-figaro-black/10 pt-5">
                <span className="font-semibold text-figaro-black">Total</span>
                <span className="font-semibold text-figaro-black">
                  {totalPrice > 0 ? `$${totalPrice}` : "free"}
                </span>
              </div>

              {/* Continue / Book Button */}
              <button
                type="button"
                disabled={!canContinue() || submitting}
                onClick={() => {
                  if (step === 3) {
                    handleSubmit();
                  } else {
                    setStep(step + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={`mt-5 w-full rounded-full py-3.5 text-center font-semibold transition-all ${
                  canContinue()
                    ? "bg-figaro-dark text-white hover:bg-figaro-black"
                    : "cursor-not-allowed bg-figaro-black/20 text-figaro-black/40"
                }`}
              >
                {submitting
                  ? "Booking..."
                  : step === 3
                    ? `Book Now${totalPrice > 0 ? ` — $${totalPrice}` : ""}`
                    : "Continue"}
              </button>

              {/* Back Button */}
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStep(step - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mt-2 w-full py-2 text-center text-sm text-figaro-black/50 transition-colors hover:text-figaro-black"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
