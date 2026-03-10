"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { notFound } from "next/navigation";

interface BarberProfile {
  id: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  phone: string | null;
  title: string | null;
  tagline: string | null;
  specialties: string[];
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  isActive: boolean;
  schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isOff: boolean;
  }[];
}

const BARBER_IMAGES: Record<string, string> = {
  ricardo: "/images/gallery/Ricardo.webp",
  zeke: "/images/gallery/Zeke.webp",
  bryam: "/images/gallery/Bryam.webp",
  johnny: "/images/gallery/Johnny.webp",
  david: "/images/gallery/David.webp",
  austin: "/images/gallery/Austin.webp",
};

const HERO_BACKGROUNDS: Record<string, string> = {
  ricardo: "/images/gallery/0f0eafba-ce21-40b2-9249-3267e20a9258.avif",
  zeke: "/images/gallery/b8ee786a-35ef-42bb-aaec-7024eed7ff0d.avif",
  bryam: "/images/gallery/c2416687-39d6-452d-bb63-f36b13392fb6.avif",
  johnny: "/images/gallery/147500a7-f1d7-49f8-8f06-8364382d0e30.avif",
  david: "/images/gallery/7ac62a21-d603-44af-b2c9-2efb751c2b7e.avif",
  austin: "/images/gallery/73245090-d1c9-498f-b124-21345a191ea9.avif",
};

const HERO_BG_POSITION: Record<string, string> = {
  bryam: "center 60%",
};

const PORTFOLIO_MAP: Record<string, string[]> = {
  ricardo: [
    "/images/gallery/0f0eafba-ce21-40b2-9249-3267e20a9258.avif",
    "/images/gallery/1f90f5fc-0611-404e-88f2-f6bb297399e6.avif",
    "/images/gallery/73245090-d1c9-498f-b124-21345a191ea9.avif",
    "/images/gallery/bf1b23b5-121e-47b5-8978-742b3b72cee4.avif",
    "/images/gallery/e9b42163-ff7a-4154-a812-e14bce676fd9.avif",
    "/images/gallery/rick.avif",
  ],
  zeke: [
    "/images/gallery/b8ee786a-35ef-42bb-aaec-7024eed7ff0d.avif",
    "/images/gallery/d9e95b66-89d7-4a84-9bd3-ff318523a309.avif",
    "/images/gallery/4c9c44b6-29da-46b3-a958-83e43eaf94e6.avif",
    "/images/gallery/307bda86-2dd4-4888-84cf-672f51fba19a.avif",
    "/images/gallery/f215f0ff-3f65-4785-95f0-8384c4213df5.avif",
  ],
  bryam: [
    "/images/gallery/c2416687-39d6-452d-bb63-f36b13392fb6.avif",
    "/images/gallery/e0c8f9fd-7805-49ae-b8f3-56b1f632eae4.avif",
    "/images/gallery/fefb8471-935f-4463-a126-d88aefbb2066.avif",
  ],
  johnny: [
    "/images/gallery/147500a7-f1d7-49f8-8f06-8364382d0e30.avif",
    "/images/gallery/1e0e2728-5887-4fac-8103-2a81de962a44.avif",
    "/images/gallery/2912f516-107b-44d7-8cbc-99cef0058e50.avif",
    "/images/gallery/554cd652-6144-4367-a3b5-abd9c917f753.avif",
    "/images/gallery/65281bbd-e4b2-4970-8f5f-bf4ae186b82d.avif",
  ],
  david: [
    "/images/gallery/7ac62a21-d603-44af-b2c9-2efb751c2b7e.avif",
    "/images/gallery/8c683446-87ee-4d58-ae1f-1ea2a81be8e2.avif",
    "/images/gallery/f791ab6a-8e8e-403c-9e1f-76e6eab452fb.avif",
    "/images/gallery/0851b548-ca23-4717-a212-d9a54545231b.avif",
    "/images/gallery/0f0eafba-ce21-40b2-9249-3267e20a9258.avif",
    "/images/gallery/1f90f5fc-0611-404e-88f2-f6bb297399e6.avif",
  ],
  austin: [
    "/images/gallery/73245090-d1c9-498f-b124-21345a191ea9.avif",
    "/images/gallery/bf1b23b5-121e-47b5-8978-742b3b72cee4.avif",
    "/images/gallery/b8ee786a-35ef-42bb-aaec-7024eed7ff0d.avif",
    "/images/gallery/d9e95b66-89d7-4a84-9bd3-ff318523a309.avif",
    "/images/gallery/4c9c44b6-29da-46b3-a958-83e43eaf94e6.avif",
  ],
};

// DB convention: 1=Monday, 2=Tuesday, ..., 7=Sunday
const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};
const DAY_ABBREVIATIONS: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

function formatTime(time: string): string {
  const parts = time.split(":").map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const ampm = hours >= 12 ? "pm" : "am";
  const displayHour = hours % 12 || 12;
  return minutes === 0
    ? `${displayHour}${ampm}`
    : `${displayHour}:${String(minutes).padStart(2, "0")}${ampm}`;
}

export default function BarberProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string | null>(null);
  const [barber, setBarber] = useState<BarberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/barbers/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data: BarberProfile) => {
        setBarber(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-figaro-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-figaro-teal border-t-transparent" />
      </div>
    );
  }

  if (error || !barber || !slug) {
    notFound();
  }

  const slugLower = slug.toLowerCase();
  const image = BARBER_IMAGES[slugLower];
  const role = barber.title ?? "Barber";
  const specialties = barber.specialties ?? [];
  const tagline = barber.tagline ?? "";
  const heroBg = HERO_BACKGROUNDS[slugLower];
  const heroBgPosition = HERO_BG_POSITION[slugLower] ?? "center 25%";
  const portfolio = PORTFOLIO_MAP[slugLower] ?? [];

  const workingDays = barber.schedules
    .filter((s) => !s.isOff)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const offDays = barber.schedules
    .filter((s) => s.isOff)
    .map((s) => DAY_ABBREVIATIONS[s.dayOfWeek]);

  return (
    <>
      {/* === HERO === */}
      <section className="relative flex min-h-[85vh] items-end overflow-hidden bg-figaro-dark">
        {/* Atmospheric background */}
        {heroBg && (
          <div className="absolute inset-0">
            <img
              src={heroBg}
              alt=""
              className="h-full w-full object-cover opacity-30"
              style={{ objectPosition: heroBgPosition }}
              aria-hidden="true"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-figaro-dark via-figaro-dark/30 to-figaro-dark/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-figaro-dark via-figaro-dark/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-figaro-teal via-figaro-gold to-figaro-teal" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-2">
            {/* Text content */}
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-figaro-teal" />
                  <p className="text-sm font-medium uppercase tracking-[0.3em] text-figaro-teal">
                    {role}
                  </p>
                </div>
              </motion.div>

              <motion.h1
                className="mt-5 text-5xl font-bold tracking-tight text-figaro-cream sm:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                {barber.firstName}
                <span className="block text-3xl font-light tracking-wide text-figaro-cream/40 sm:text-4xl">
                  {barber.lastName}
                </span>
              </motion.h1>

              <motion.p
                className="mt-6 max-w-md text-lg leading-relaxed text-figaro-cream/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                {tagline}
              </motion.p>

              <motion.div
                className="mt-8 flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link
                  href="/book"
                  className="rounded-sm bg-figaro-gold px-8 py-3.5 text-base font-semibold text-figaro-dark transition-all hover:bg-figaro-gold-light hover:shadow-lg hover:shadow-figaro-gold/20"
                >
                  Book with {barber.firstName}
                </Link>
                <a
                  href="tel:+17607512008"
                  className="rounded-sm border border-figaro-cream/20 px-8 py-3.5 text-base font-semibold text-figaro-cream/70 transition-colors hover:border-figaro-cream/40 hover:text-figaro-cream"
                >
                  Call the Shop
                </a>
              </motion.div>

              {/* Social links */}
              {(barber.instagram || barber.facebook || barber.tiktok) && (
                <motion.div
                  className="mt-6 flex items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  {barber.instagram && (
                    <a
                      href={`https://instagram.com/${barber.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-figaro-cream/50 transition-colors hover:text-figaro-teal"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
                      </svg>
                      @{barber.instagram}
                    </a>
                  )}
                  {barber.facebook && (
                    <a
                      href={`https://facebook.com/${barber.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-figaro-cream/50 transition-colors hover:text-figaro-gold"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
                      </svg>
                      {barber.facebook}
                    </a>
                  )}
                  {barber.tiktok && (
                    <a
                      href={`https://tiktok.com/@${barber.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-figaro-cream/50 transition-colors hover:text-figaro-cream"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07Z" />
                      </svg>
                      @{barber.tiktok}
                    </a>
                  )}
                </motion.div>
              )}
            </div>

            {/* Barber portrait */}
            {image && (
              <motion.div
                className="order-1 flex justify-center lg:order-2 lg:justify-end"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="absolute -inset-1 rounded-sm bg-gradient-to-br from-figaro-teal/30 via-figaro-gold/20 to-figaro-teal/30 blur-sm" />
                  <div className="relative h-80 w-64 overflow-hidden rounded-sm border border-figaro-cream/10 sm:h-96 sm:w-72 lg:h-[28rem] lg:w-80">
                    <img
                      src={image}
                      alt={`${barber.firstName} ${barber.lastName} - ${role} at Figaro Barbershop`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-figaro-dark/30 to-transparent" />
                  </div>
                  {/* Accent corner marks */}
                  <div className="absolute -left-3 -top-3 h-6 w-6 border-l-2 border-t-2 border-figaro-teal/50" />
                  <div className="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2 border-figaro-gold/50" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* === ABOUT & SPECIALTIES === */}
      <section className="bg-figaro-cream py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-figaro-teal" />
                <p className="text-sm font-semibold uppercase tracking-widest text-figaro-teal">
                  About
                </p>
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-figaro-black sm:text-4xl">
                The Story
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-figaro-black/70">{barber.bio}</p>
              <p className="mt-4 text-base leading-relaxed text-figaro-black/50">
                Every client who sits in {barber.firstName}&apos;s chair gets the full Figaro
                experience &mdash; a hot towel, attention to detail, and a cut that makes you feel
                like the best version of yourself. No shortcuts, no rush. Just craft.
              </p>
            </motion.div>

            {/* Specialties */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <div className="flex items-center gap-3">
                <div className="h-px w-8 bg-figaro-gold" />
                <p className="text-sm font-semibold uppercase tracking-widest text-figaro-gold">
                  Expertise
                </p>
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-figaro-black sm:text-4xl">
                Specialties
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {specialties.map((specialty, index) => (
                  <motion.div
                    key={specialty}
                    className={`group rounded-sm border p-5 transition-all hover:shadow-lg ${
                      index % 2 === 0
                        ? "border-figaro-black/10 hover:border-figaro-teal/30 hover:shadow-figaro-teal/5"
                        : "border-figaro-black/10 hover:border-figaro-gold/30 hover:shadow-figaro-gold/5"
                    }`}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          index % 2 === 0
                            ? "bg-figaro-teal/10 text-figaro-teal"
                            : "bg-figaro-gold/10 text-figaro-gold"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      </div>
                      <span className="text-base font-medium text-figaro-black">{specialty}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* === PORTFOLIO GALLERY === */}
      {portfolio.length > 0 && (
        <section className="bg-figaro-dark py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-figaro-teal" />
                <p className="text-sm font-semibold uppercase tracking-widest text-figaro-teal">
                  Portfolio
                </p>
                <div className="h-px w-8 bg-figaro-teal" />
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-figaro-cream sm:text-4xl">
                {barber.firstName}&apos;s Work
              </h2>
              <p className="mx-auto mt-4 max-w-md text-figaro-cream/50">
                Every cut is a canvas. Here&apos;s a look at the craft.
              </p>
            </motion.div>

            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {portfolio.map((src, index) => (
                <motion.div
                  key={src}
                  className="group relative aspect-square overflow-hidden rounded-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  viewport={{ once: true, margin: "-30px" }}
                >
                  <img
                    src={src}
                    alt={`Work by ${barber.firstName} at Figaro Barbershop`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-figaro-dark/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  {/* Hover border accent */}
                  <div
                    className={`absolute inset-0 rounded-sm border-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                      index % 2 === 0 ? "border-figaro-teal/40" : "border-figaro-gold/40"
                    }`}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* === SCHEDULE === */}
      {workingDays.length > 0 && (
        <section className="bg-figaro-cream py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-80px" }}
            >
              <div className="flex items-center justify-center gap-3">
                <div className="h-px w-8 bg-figaro-gold" />
                <p className="text-sm font-semibold uppercase tracking-widest text-figaro-gold">
                  Availability
                </p>
                <div className="h-px w-8 bg-figaro-gold" />
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-figaro-black sm:text-4xl">
                When to Find {barber.firstName}
              </h2>
            </motion.div>

            <div className="mt-10 overflow-hidden rounded-sm border border-figaro-black/10 bg-white">
              {workingDays.map((schedule, index) => (
                <motion.div
                  key={schedule.dayOfWeek}
                  className={`flex items-center justify-between px-6 py-4 ${
                    index < workingDays.length - 1 ? "border-b border-figaro-black/5" : ""
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  viewport={{ once: true }}
                >
                  <span className="text-base font-medium text-figaro-black">
                    {DAY_NAMES[schedule.dayOfWeek]}
                  </span>
                  <span className="text-base text-figaro-black/60">
                    {formatTime(schedule.startTime)} &ndash; {formatTime(schedule.endTime)}
                  </span>
                </motion.div>
              ))}
              {offDays.length > 0 && (
                <div className="border-t border-figaro-black/5 bg-figaro-cream/50 px-6 py-3">
                  <p className="text-sm text-figaro-black/40">Off: {offDays.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* === CTA SECTION === */}
      <section className="relative overflow-hidden bg-figaro-teal py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-figaro-teal-dark to-figaro-teal" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-figaro-gold via-figaro-gold-light to-figaro-gold" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Sit in {barber.firstName}&apos;s Chair?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Book online or walk in &mdash; {barber.firstName} is ready to craft your perfect look.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/book"
                className="rounded-sm bg-figaro-gold px-8 py-3.5 text-base font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light"
              >
                Book with {barber.firstName}
              </Link>
              <Link
                href="/barbers"
                className="rounded-sm border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
              >
                View All Barbers
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
