"use client";

import { motion } from "motion/react";
import type { Service } from "./types";
import { formatTimeLabel } from "./types";

interface BookingSuccessProps {
  barberName: string;
  date: string;
  time: string;
  selectedServices: Service[];
  totalPrice: number;
}

export default function BookingSuccess({
  barberName,
  date,
  time,
  selectedServices,
  totalPrice,
}: BookingSuccessProps) {
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
            {barberName} &middot;{" "}
            {new Date(`${date}T${time}:00`).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}{" "}
            at {formatTimeLabel(time)}
          </p>
          <div className="mt-3 space-y-1">
            {selectedServices.map((s) => (
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
