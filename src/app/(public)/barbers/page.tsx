import Link from "next/link";
import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Barbers",
  description: "Meet the master barbers at Figaro Barbershop Leucadia.",
};

const BARBER_IMAGES: Record<string, string> = {
  Ricardo: "/images/gallery/Ricardo.webp",
  Zeke: "/images/gallery/Zeke.webp",
  Bryam: "/images/gallery/Bryam.webp",
  Johnny: "/images/gallery/Johnny.webp",
  David: "/images/gallery/David.webp",
  Austin: "/images/gallery/Austin.webp",
};

const PORTFOLIO_IMAGES = [
  "/images/gallery/0f0eafba-ce21-40b2-9249-3267e20a9258.avif",
  "/images/gallery/1f90f5fc-0611-404e-88f2-f6bb297399e6.avif",
  "/images/gallery/73245090-d1c9-498f-b124-21345a191ea9.avif",
  "/images/gallery/bf1b23b5-121e-47b5-8978-742b3b72cee4.avif",
  "/images/gallery/b8ee786a-35ef-42bb-aaec-7024eed7ff0d.avif",
  "/images/gallery/d9e95b66-89d7-4a84-9bd3-ff318523a309.avif",
  "/images/gallery/4c9c44b6-29da-46b3-a958-83e43eaf94e6.avif",
  "/images/gallery/8b48bb2a-0289-49e8-85f7-2aebefabf530.avif",
];

export default async function BarbersPage() {
  const barbers = await db.barber.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      {/* Hero Banner */}
      <section className="relative flex h-64 items-center justify-center overflow-hidden bg-figaro-dark sm:h-80">
        <img
          src="/images/shop-chairs.webp"
          alt="Figaro Barbershop interior"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-figaro-dark/40 to-figaro-dark/80" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-figaro-teal via-figaro-gold to-figaro-teal" />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-figaro-teal" />
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-figaro-teal">
              The Crew
            </p>
            <div className="h-px w-8 bg-figaro-teal" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-figaro-cream sm:text-5xl">
            Meet Your Barbers
          </h1>
          <p className="mx-auto mt-4 max-w-md text-figaro-cream/50">
            The craftsmen behind the chair. Each barber brings their own style and expertise.
          </p>
        </div>
      </section>

      {/* Barbers Grid */}
      <section className="bg-figaro-cream py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {barbers.map((barber, index) => (
              <Link
                key={barber.id}
                href={`/barbers/${barber.firstName.toLowerCase()}`}
                className="group overflow-hidden rounded-sm border border-figaro-black/10 bg-white transition-all hover:border-figaro-teal/30 hover:shadow-xl hover:shadow-figaro-teal/5"
              >
                {BARBER_IMAGES[barber.firstName] ? (
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={BARBER_IMAGES[barber.firstName]}
                      alt={`${barber.firstName} ${barber.lastName} - Barber at Figaro`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-figaro-dark/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-4 left-4 right-4 text-center opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="text-sm font-medium text-white">View Profile &rarr;</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-figaro-dark to-figaro-black">
                    <span className="text-7xl font-bold text-figaro-gold/15 transition-colors group-hover:text-figaro-teal/25">
                      {barber.firstName[0]}
                    </span>
                    <div
                      className={`absolute bottom-6 left-6 right-6 h-px ${
                        index % 2 === 0 ? "bg-figaro-gold/20" : "bg-figaro-teal/20"
                      }`}
                    />
                  </div>
                )}
                <div
                  className={`border-t-2 p-6 ${
                    index % 2 === 0 ? "border-figaro-gold" : "border-figaro-teal"
                  } transition-colors ${
                    index % 2 === 0
                      ? "group-hover:border-figaro-teal"
                      : "group-hover:border-figaro-gold"
                  }`}
                >
                  <h2 className="text-xl font-semibold text-figaro-black">
                    {barber.firstName} {barber.lastName}
                  </h2>
                  {barber.bio && (
                    <p className="mt-2 text-sm leading-relaxed text-figaro-black/60">
                      {barber.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="bg-figaro-dark py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-figaro-teal" />
              <p className="text-sm font-semibold uppercase tracking-widest text-figaro-teal">
                Portfolio
              </p>
              <div className="h-px w-8 bg-figaro-teal" />
            </div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-figaro-cream sm:text-4xl">
              Our Work
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {PORTFOLIO_IMAGES.map((src, index) => (
              <div
                key={src}
                className={`group relative aspect-square overflow-hidden rounded-sm ${
                  index % 3 === 0 ? "ring-1 ring-figaro-gold/10" : "ring-1 ring-figaro-teal/10"
                }`}
              >
                <img
                  src={src}
                  alt="Haircut by Figaro Barbershop"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-figaro-dark/0 transition-colors group-hover:bg-figaro-dark/20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
