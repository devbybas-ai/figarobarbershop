"use client";

import type { Service } from "./types";
import { formatDuration, formatTimeLabel } from "./types";

interface BookingSidebarProps {
  children: React.ReactNode;
  step: number;
  selectedServices: Service[];
  barberName: string | undefined;
  date: string;
  time: string;
  totalPrice: number;
  totalDuration: number;
  canContinue: boolean;
  submitting: boolean;
  submitError: string;
  mobileCartOpen: boolean;
  onMobileCartToggle: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export default function BookingSidebar({
  children,
  step,
  selectedServices,
  barberName,
  date,
  time,
  totalPrice,
  totalDuration,
  canContinue,
  submitting,
  submitError,
  mobileCartOpen,
  onMobileCartToggle,
  onContinue,
  onBack,
}: BookingSidebarProps) {
  return (
    <>
      {/* Mobile Sticky Top Cart Bar */}
      <div className="sticky top-[3.6rem] z-30 mt-6 lg:hidden">
        <div className="-mx-4 border-b border-figaro-black/10 bg-white px-5 pb-4 pt-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onMobileCartToggle}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              )}
            </button>
            {canContinue && (
              <button
                type="button"
                onClick={onContinue}
                className="flex-shrink-0 rounded-full bg-figaro-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-figaro-black"
              >
                {submitting ? "Booking..." : step === 3 ? `Book — $${totalPrice}` : "Continue"}
              </button>
            )}
          </div>
        </div>

        {/* Expandable cart details */}
        {mobileCartOpen && selectedServices.length > 0 && (
          <div className="mx-4 mt-2 rounded-xl border border-figaro-black/10 bg-white px-5 py-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-figaro-black">Your Services</p>
              <p className="text-sm font-semibold text-figaro-black">${totalPrice}</p>
            </div>
            <div className="space-y-3">
              {selectedServices.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-figaro-black">{s.name}</p>
                    <p className="text-xs text-figaro-black/40">
                      {formatDuration(s.durationMinutes)}
                    </p>
                  </div>
                  <p className="text-sm text-figaro-black/60">${Number(s.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content + Desktop Sidebar */}
      <div className="mt-4 flex flex-col gap-8 lg:mt-8 lg:flex-row">
        {children}

        {/* Desktop Sidebar */}
        <div className="hidden w-full lg:block lg:w-80">
          <div className="sticky top-32 rounded-lg border border-figaro-black/10 bg-white p-6">
            {/* Shop Info */}
            <div className="flex items-center gap-3">
              <img
                src="/images/figaro-logo.avif"
                alt="Figaro Barbershop"
                className="h-16 w-16 flex-shrink-0 object-contain"
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
                <a
                  href="https://maps.google.com/?q=114+Leucadia+Blvd,+Encinitas,+CA+92024"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 block text-xs text-figaro-black/40 transition-colors hover:text-figaro-teal"
                >
                  114 Leucadia Boulevard, Encinitas
                </a>
              </div>
            </div>

            {/* Selected Items */}
            <div className="mt-5 border-t border-figaro-black/10 pt-5">
              {selectedServices.length === 0 ? (
                <p className="text-sm text-figaro-black/40">No services selected</p>
              ) : (
                <div className="space-y-3">
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-figaro-black">{s.name}</p>
                        <p className="text-xs text-figaro-black/40">
                          {formatDuration(s.durationMinutes)}
                          {barberName ? ` with ${barberName}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-figaro-black">${Number(s.price)}</p>
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
                        at {formatTimeLabel(time)}
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

            {submitError && (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </p>
            )}

            {/* Continue / Book Button */}
            <button
              type="button"
              disabled={!canContinue || submitting}
              onClick={onContinue}
              className={`mt-5 w-full rounded-full py-3.5 text-center font-semibold transition-all ${
                canContinue
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
                onClick={onBack}
                className="mt-2 w-full py-2 text-center text-sm text-figaro-black/50 transition-colors hover:text-figaro-black"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
