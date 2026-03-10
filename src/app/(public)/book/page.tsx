"use client";

import { useEffect, useMemo, useState } from "react";
import type { Barber, Service, TimeSlot } from "@/components/public/booking/types";
import { formatTimeLabel } from "@/components/public/booking/types";
import StepServices from "@/components/public/booking/StepServices";
import StepProfessional from "@/components/public/booking/StepProfessional";
import StepTime from "@/components/public/booking/StepTime";
import StepConfirm from "@/components/public/booking/StepConfirm";
import BookingSidebar from "@/components/public/booking/BookingSidebar";
import BookingSuccess from "@/components/public/booking/BookingSuccess";

const STEPS = ["Services", "Professional", "Time", "Confirm"] as const;

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
  const [submitError, setSubmitError] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  const selectedServiceObjects = services.filter((s) => selectedServices.includes(s.id));
  const totalPrice = selectedServiceObjects.reduce((sum, s) => sum + Number(s.price), 0);
  const totalDuration = selectedServiceObjects.reduce((sum, s) => sum + s.durationMinutes, 0);
  const categories = useMemo(() => [...new Set(services.map((s) => s.category))], [services]);
  const selectedBarberObj = barbers.find((b) => b.id === selectedBarber);

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

  // Fetch available time slots when date, barber, or service duration changes
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
        const slots: TimeSlot[] = (data.availableSlots ?? []).map((s: string) => ({
          time: s,
          label: formatTimeLabel(s),
        }));
        setAvailableSlots(slots);
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, selectedBarber, totalDuration]);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function canContinue(): boolean {
    if (step === 0) return selectedServices.length > 0;
    if (step === 1) return !!selectedBarber;
    if (step === 2) return !!date && !!time;
    if (step === 3) return !!firstName && !!lastName && !!email && !!phone;
    return false;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientFirstName: firstName,
          clientLastName: lastName,
          clientEmail: email,
          clientPhone: phone,
          barberId: selectedBarber,
          serviceIds: selectedServices,
          scheduledAt,
          type: "BOOKED",
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => null);
        setSubmitError(
          (data as { error?: string } | null)?.error ??
            "Failed to book appointment. Please try again.",
        );
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (step === 3) {
      handleSubmit();
    } else {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <BookingSuccess
        barberName={selectedBarberObj?.firstName ?? ""}
        date={date}
        time={time}
        selectedServices={selectedServiceObjects}
        totalPrice={totalPrice}
      />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
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

        <BookingSidebar
          step={step}
          selectedServices={selectedServiceObjects}
          barberName={selectedBarberObj?.firstName}
          date={date}
          time={time}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
          canContinue={canContinue()}
          submitting={submitting}
          submitError={submitError}
          mobileCartOpen={mobileCartOpen}
          onMobileCartToggle={() => setMobileCartOpen(!mobileCartOpen)}
          onContinue={handleContinue}
          onBack={handleBack}
        >
          <div className="flex-1">
            {step === 0 && (
              <StepServices
                services={services}
                categories={categories}
                activeCategory={activeCategory}
                selectedServices={selectedServices}
                onActiveCategoryChange={setActiveCategory}
                onToggleService={toggleService}
              />
            )}

            {step === 1 && (
              <StepProfessional
                barbers={barbers}
                selectedBarber={selectedBarber}
                onSelectBarber={setSelectedBarber}
              />
            )}

            {step === 2 && (
              <StepTime
                barberName={selectedBarberObj?.firstName ?? ""}
                dateOptions={dateOptions}
                datePageStart={datePageStart}
                date={date}
                time={time}
                availableSlots={availableSlots}
                loadingSlots={loadingSlots}
                onDatePageStartChange={setDatePageStart}
                onDateChange={setDate}
                onTimeChange={setTime}
              />
            )}

            {step === 3 && (
              <StepConfirm
                firstName={firstName}
                lastName={lastName}
                email={email}
                phone={phone}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onEmailChange={setEmail}
                onPhoneChange={setPhone}
              />
            )}
          </div>
        </BookingSidebar>
      </div>
    </section>
  );
}
