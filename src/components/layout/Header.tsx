"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/barbers", label: "Our Barbers" },
  { href: "/book", label: "Book Now" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-figaro-dark/95 backdrop-blur-sm">
      {/* Teal accent strip */}
      <div className="h-0.5 bg-gradient-to-r from-figaro-teal via-figaro-gold to-figaro-teal" />

      <div className="border-b border-figaro-gold/15">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-figaro-cream">FIGARO</span>
            <span className="hidden text-2xl font-light tracking-widest text-figaro-gold sm:block">
              BARBERSHOP
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium tracking-wide text-figaro-cream/70 transition-colors hover:text-figaro-teal"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <Link
              href="/book"
              className="rounded-sm bg-figaro-gold px-5 py-2.5 text-sm font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light"
            >
              Book Appointment
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="flex items-center justify-center rounded-sm p-2 text-figaro-cream md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav
          className="border-b border-figaro-gold/15 bg-figaro-dark md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="space-y-1 px-4 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-sm px-3 py-2.5 text-base font-medium text-figaro-cream/80 transition-colors hover:bg-figaro-teal/10 hover:text-figaro-teal"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/book"
                className="block rounded-sm bg-figaro-gold px-3 py-2.5 text-center text-base font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light"
                onClick={() => setMobileOpen(false)}
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
