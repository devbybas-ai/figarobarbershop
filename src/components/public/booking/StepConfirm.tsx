"use client";

import { motion } from "motion/react";

interface StepConfirmProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}

export default function StepConfirm({
  firstName,
  lastName,
  email,
  phone,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
}: StepConfirmProps) {
  return (
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
            <label htmlFor="firstName" className="block text-sm font-medium text-figaro-black">
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-figaro-black">
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-figaro-black">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-figaro-black">
            Phone *
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
          />
        </div>
      </div>
    </motion.div>
  );
}
