"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  durationMinutes: number;
  price: string;
  isActive: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  HAIRCUT: "Haircuts",
  BEARD: "Beard",
  SHAVE: "Shaves",
  COMBO: "Combos",
  OTHER: "Other",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <div>
      <h2 className="text-2xl font-bold text-figaro-cream">Services</h2>

      {categories.map((cat) => (
        <div key={cat} className="mt-8">
          <h3 className="text-lg font-semibold text-figaro-gold">{CATEGORY_LABELS[cat] ?? cat}</h3>
          <div className="mt-3 space-y-2">
            {services
              .filter((s) => s.category === cat)
              .map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-sm border border-figaro-gold/10 bg-figaro-dark p-4"
                >
                  <div>
                    <h4 className="font-medium text-figaro-cream">{service.name}</h4>
                    {service.description && (
                      <p className="mt-1 text-sm text-figaro-cream/50">{service.description}</p>
                    )}
                    <p className="mt-1 text-xs text-figaro-cream/40">
                      {service.durationMinutes} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-figaro-gold">
                      {formatCurrency(Number(service.price))}
                    </p>
                    <span
                      className={`text-xs ${service.isActive ? "text-green-400" : "text-red-400"}`}
                    >
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
