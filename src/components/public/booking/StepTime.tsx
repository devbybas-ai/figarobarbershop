"use client";

import { motion } from "motion/react";
import type { TimeSlot } from "./types";

interface DateOption {
  value: string;
  dayName: string;
  dayNum: number;
  month: string;
}

interface StepTimeProps {
  barberName: string;
  dateOptions: DateOption[];
  datePageStart: number;
  date: string;
  time: string;
  availableSlots: TimeSlot[];
  loadingSlots: boolean;
  onDatePageStartChange: (start: number) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export default function StepTime({
  barberName,
  dateOptions,
  datePageStart,
  date,
  time,
  availableSlots,
  loadingSlots,
  onDatePageStartChange,
  onDateChange,
  onTimeChange,
}: StepTimeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold text-figaro-black">Time</h1>
      <p className="mt-2 text-figaro-black/50">Pick a date and time with {barberName}</p>

      {/* Date Picker */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-figaro-black/70">Date</h2>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onDatePageStartChange(Math.max(0, datePageStart - 7))}
              disabled={datePageStart === 0}
              className={`rounded-lg border p-2 transition-all ${
                datePageStart === 0
                  ? "cursor-not-allowed border-figaro-black/5 text-figaro-black/20"
                  : "border-figaro-black/10 text-figaro-black/60 hover:border-figaro-black/20 hover:text-figaro-black"
              }`}
              aria-label="Previous week"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() =>
                onDatePageStartChange(Math.min(dateOptions.length - 7, datePageStart + 7))
              }
              disabled={datePageStart + 7 >= dateOptions.length}
              className={`rounded-lg border p-2 transition-all ${
                datePageStart + 7 >= dateOptions.length
                  ? "cursor-not-allowed border-figaro-black/5 text-figaro-black/20"
                  : "border-figaro-black/10 text-figaro-black/60 hover:border-figaro-black/20 hover:text-figaro-black"
              }`}
              aria-label="Next week"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
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
              onClick={() => onDateChange(d.value)}
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
                  onClick={() => onTimeChange(slot.time)}
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
  );
}
