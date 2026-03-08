"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

interface Barber {
  id: string;
  firstName: string;
  lastName: string;
}

export default function IntakePage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    fetch("/api/barbers")
      .then((res) => res.json())
      .then((data: Barber[]) => setBarbers(data))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      firstName: form.get("firstName") as string,
      lastName: form.get("lastName") as string,
      email: form.get("email") as string,
      phone: (form.get("phone") as string) || undefined,
      preferredBarber: (form.get("preferredBarber") as string) || undefined,
      hairType: (form.get("hairType") as string) || undefined,
      allergies: (form.get("allergies") as string) || undefined,
      referral: (form.get("referral") as string) || undefined,
      notes: (form.get("notes") as string) || undefined,
    };

    try {
      const res = await fetch("/api/clients/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
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
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-figaro-gold/20 text-figaro-gold">
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
          <h2 className="mt-4 text-2xl font-bold text-figaro-black">Thank You!</h2>
          <p className="mt-2 text-figaro-black/60">
            Your intake form has been submitted. We&apos;re ready to take care of you.
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="bg-figaro-cream py-16">
      <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-figaro-black sm:text-4xl">
            New Client Intake
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-figaro-gold" />
          <p className="mt-4 text-figaro-black/60">
            Help us get to know you better so we can deliver the best experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div
              className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-figaro-black">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-figaro-black">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-figaro-black">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-figaro-black">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
            />
          </div>

          <div>
            <label htmlFor="hairType" className="block text-sm font-medium text-figaro-black">
              Hair Type
            </label>
            <select
              id="hairType"
              name="hairType"
              className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
            >
              <option value="">Select</option>
              <option value="straight">Straight</option>
              <option value="wavy">Wavy</option>
              <option value="curly">Curly</option>
              <option value="coily">Coily</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="preferredBarber"
              className="block text-sm font-medium text-figaro-black"
            >
              Preferred Barber
            </label>
            <select
              id="preferredBarber"
              name="preferredBarber"
              className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
            >
              <option value="">No preference</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.firstName}>
                  {b.firstName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="allergies" className="block text-sm font-medium text-figaro-black">
              Allergies or Skin Sensitivities
            </label>
            <input
              id="allergies"
              name="allergies"
              type="text"
              placeholder="e.g., sensitive skin, latex allergy"
              className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black placeholder:text-figaro-black/30 focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
            />
          </div>

          <div>
            <label htmlFor="referral" className="block text-sm font-medium text-figaro-black">
              How did you hear about us?
            </label>
            <select
              id="referral"
              name="referral"
              className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
            >
              <option value="">Select</option>
              <option value="instagram">Instagram</option>
              <option value="google">Google</option>
              <option value="friend">Friend / Family</option>
              <option value="walk-by">Walked by</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-figaro-black">
              Anything else we should know?
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm bg-figaro-gold px-4 py-3 font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Intake Form"}
          </button>
        </form>
      </div>
    </section>
  );
}
