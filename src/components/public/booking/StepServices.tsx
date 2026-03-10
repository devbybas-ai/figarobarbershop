"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import type { Service } from "./types";
import { CATEGORY_LABELS, formatDuration } from "./types";

interface StepServicesProps {
  services: Service[];
  categories: string[];
  activeCategory: string;
  selectedServices: string[];
  onActiveCategoryChange: (cat: string) => void;
  onToggleService: (id: string) => void;
}

export default function StepServices({
  services,
  categories,
  activeCategory,
  selectedServices,
  onActiveCategoryChange,
  onToggleService,
}: StepServicesProps) {
  const isManualScroll = useRef(false);

  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScroll.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const cat = entry.target.id.replace("cat-", "");
            onActiveCategoryChange(cat);
          }
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
    );

    const timer = setTimeout(() => {
      for (const cat of categories) {
        const el = document.getElementById(`cat-${cat}`);
        if (el) observer.observe(el);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [categories, onActiveCategoryChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-3xl font-bold text-figaro-black">Services</h1>

      {/* Category Filter Tabs */}
      <div className="sticky top-[8.1rem] z-10 -mx-4 bg-figaro-cream px-4 pb-4 pt-5 sm:top-16 sm:-mx-0 sm:px-0 sm:pt-4 lg:top-16">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                isManualScroll.current = true;
                onActiveCategoryChange(cat);
                document
                  .getElementById(`cat-${cat}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                setTimeout(() => {
                  isManualScroll.current = false;
                }, 800);
              }}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-figaro-black text-white"
                  : "bg-figaro-black/5 text-figaro-black hover:bg-figaro-black/10"
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      {/* Service Cards */}
      {categories.map((cat) => (
        <div key={cat} id={`cat-${cat}`} className="mt-10 scroll-mt-[12rem] sm:scroll-mt-28">
          <h2 className="text-xl font-bold text-figaro-black">{CATEGORY_LABELS[cat] ?? cat}</h2>
          <div className="mt-5 space-y-5">
            {services
              .filter((s) => s.category === cat)
              .map((service) => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <div
                    key={service.id}
                    className={`flex items-start justify-between rounded-lg border bg-white p-6 transition-all ${
                      isSelected
                        ? "border-figaro-gold shadow-sm"
                        : "border-figaro-black/10 hover:border-figaro-black/20"
                    }`}
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-figaro-black">{service.name}</h3>
                      <p className="mt-0.5 text-sm text-figaro-black/70">
                        {formatDuration(service.durationMinutes)}
                      </p>
                      {service.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-figaro-black/70">
                          {service.description}
                        </p>
                      )}
                      <p className="mt-2.5 font-semibold text-figaro-black">
                        ${Number(service.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleService(service.id)}
                      className={`mt-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        isSelected
                          ? "border-figaro-gold bg-figaro-gold text-white"
                          : "border-figaro-black/20 text-figaro-black/40 hover:border-figaro-black/40"
                      }`}
                      aria-label={isSelected ? `Remove ${service.name}` : `Add ${service.name}`}
                    >
                      {isSelected ? (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
