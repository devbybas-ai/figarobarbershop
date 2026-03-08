"use client";

import { useEffect, useState } from "react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  intakeCompleted: boolean;
  createdAt: string;
  _count: { appointments: number };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/clients${params}`)
      .then((r) => r.json())
      .then(setClients)
      .catch(() => setClients([]));
  }, [search]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-figaro-cream">Clients</h2>
        <input
          type="search"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-sm border border-figaro-gold/20 bg-figaro-dark px-3 py-2 text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-gold focus:outline-none"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-figaro-gold/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-figaro-gold/10 bg-figaro-dark">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Phone
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Visits
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Intake
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-figaro-gold/5">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-figaro-cream/40">
                  No clients found
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="hover:bg-figaro-gold/5">
                  <td className="px-4 py-3 text-sm font-medium text-figaro-cream">
                    {client.firstName} {client.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-figaro-cream/70">{client.email ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-figaro-cream/70">{client.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-sm text-figaro-gold">
                    {client._count.appointments}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        client.intakeCompleted ? "bg-green-400" : "bg-figaro-cream/20"
                      }`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
