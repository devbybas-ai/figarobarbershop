import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description: "Browse our full menu of barbershop services at Figaro Barbershop Leucadia.",
};

const CATEGORY_LABELS: Record<string, string> = {
  HAIRCUT: "Haircuts",
  BEARD: "Beard",
  SHAVE: "Shaves",
  COMBO: "Combos",
  OTHER: "Other",
};

const CATEGORY_ACCENTS: Record<string, "gold" | "teal"> = {
  HAIRCUT: "gold",
  BEARD: "teal",
  SHAVE: "gold",
  COMBO: "teal",
  OTHER: "gold",
};

export default async function ServicesPage() {
  const services = await db.service.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { price: "asc" }],
  });

  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <>
      {/* Hero Banner */}
      <section className="relative flex h-64 items-center justify-center overflow-hidden bg-figaro-dark sm:h-80">
        <img
          src="/images/shop-wall.jpg"
          alt="Figaro Barbershop interior with vintage grooming products"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-figaro-dark/40 to-figaro-dark/80" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-figaro-teal via-figaro-gold to-figaro-teal" />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-figaro-teal" />
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-figaro-teal">
              Services
            </p>
            <div className="h-px w-8 bg-figaro-teal" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-figaro-cream sm:text-5xl">
            The Menu
          </h1>
          <p className="mx-auto mt-4 max-w-md text-figaro-cream/50">
            All cuts &amp; faux cuts include a hot towel neck razor shave with lather.
          </p>
        </div>
      </section>

      <section className="bg-figaro-cream py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {categories.map((cat, catIndex) => {
            const accent = CATEGORY_ACCENTS[cat] ?? "gold";
            return (
              <div key={cat} className="mt-12 first:mt-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-px w-6 ${accent === "teal" ? "bg-figaro-teal" : "bg-figaro-gold"}`}
                  />
                  <h2
                    className={`text-xl font-semibold ${
                      accent === "teal" ? "text-figaro-teal-dark" : "text-figaro-gold"
                    }`}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </h2>
                </div>
                <div className="mt-4 space-y-3">
                  {services
                    .filter((s) => s.category === cat)
                    .map((service, sIndex) => (
                      <div
                        key={service.id}
                        className={`flex items-center justify-between rounded-sm border bg-white p-5 transition-all hover:shadow-md ${
                          (catIndex + sIndex) % 2 === 0
                            ? "border-figaro-black/10 hover:border-figaro-gold/30"
                            : "border-figaro-black/10 hover:border-figaro-teal/30"
                        }`}
                      >
                        <div>
                          <h3 className="font-semibold text-figaro-black">{service.name}</h3>
                          {service.description && (
                            <p className="mt-1 text-sm text-figaro-black/60">
                              {service.description}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-figaro-black/40">
                            {service.durationMinutes} minutes
                          </p>
                        </div>
                        <p
                          className={`text-xl font-bold ${
                            accent === "teal" ? "text-figaro-teal-dark" : "text-figaro-gold"
                          }`}
                        >
                          {formatCurrency(Number(service.price))}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}

          <div className="mt-12 text-center">
            <Link
              href="/book"
              className="inline-block rounded-sm bg-figaro-gold px-8 py-3.5 text-base font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light"
            >
              Book Your Appointment
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
