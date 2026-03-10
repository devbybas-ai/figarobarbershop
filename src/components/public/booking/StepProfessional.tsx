"use client";

import { motion } from "motion/react";
import type { Barber } from "./types";

interface StepProfessionalProps {
  barbers: Barber[];
  selectedBarber: string;
  onSelectBarber: (id: string) => void;
}

export default function StepProfessional({
  barbers,
  selectedBarber,
  onSelectBarber,
}: StepProfessionalProps) {
  return (
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
            onClick={() => onSelectBarber(barber.id)}
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
                <p className="mt-0.5 line-clamp-1 text-sm text-figaro-black/50">{barber.bio}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
