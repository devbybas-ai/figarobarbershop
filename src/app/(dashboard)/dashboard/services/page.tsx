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

const CATEGORIES = ["HAIRCUT", "BEARD", "SHAVE", "COMBO", "OTHER"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  HAIRCUT: "Haircuts",
  BEARD: "Beard",
  SHAVE: "Shaves",
  COMBO: "Combos",
  OTHER: "Other",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "HAIRCUT" as string,
  durationMinutes: 30,
  price: 0,
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function loadServices() {
    fetch("/api/services")
      .then((r) => r.json())
      .then(setServices)
      .catch(() => setServices([]));
  }

  useEffect(() => {
    loadServices();
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(service: Service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description ?? "",
      category: service.category,
      durationMinutes: service.durationMinutes,
      price: Number(service.price),
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      name: form.name,
      description: form.description || undefined,
      category: form.category,
      durationMinutes: form.durationMinutes,
      price: form.price,
    };

    try {
      const url = editingId ? `/api/services/${editingId}` : "/api/services";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        closeForm();
        loadServices();
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConfirmDeleteId(null);
        loadServices();
      }
    } catch {
      // silently fail
    }
  }

  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-figaro-cream">Services</h2>
        <button
          onClick={openAdd}
          className="rounded-sm bg-figaro-gold px-4 py-2 text-sm font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light"
        >
          + Add Service
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-sm border border-figaro-gold/20 bg-figaro-dark p-6">
          <h3 className="text-lg font-semibold text-figaro-cream">
            {editingId ? "Edit Service" : "New Service"}
          </h3>

          {error && (
            <div className="mt-3 rounded-sm border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-figaro-cream/70">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-figaro-cream/70">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-figaro-cream/70">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-figaro-cream/70">
                  Duration (min) *
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  step={5}
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))
                  }
                  className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-figaro-cream/70">
                  Price ($) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-sm bg-figaro-gold px-6 py-2.5 font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingId ? "Update Service" : "Add Service"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-sm border border-figaro-gold/20 px-6 py-2.5 text-figaro-cream/60 transition-colors hover:text-figaro-cream"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-figaro-gold">
                      {formatCurrency(Number(service.price))}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(service)}
                        className="rounded-sm border border-figaro-gold/20 px-3 py-1.5 text-xs text-figaro-cream/60 transition-colors hover:border-figaro-gold/40 hover:text-figaro-cream"
                      >
                        Edit
                      </button>
                      {confirmDeleteId === service.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="rounded-sm bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-sm border border-figaro-gold/20 px-3 py-1.5 text-xs text-figaro-cream/40 transition-colors hover:text-figaro-cream"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(service.id)}
                          className="rounded-sm border border-red-500/20 px-3 py-1.5 text-xs text-red-400/60 transition-colors hover:border-red-500/40 hover:text-red-400"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
