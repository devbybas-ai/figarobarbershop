"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const isOwner = session?.user?.role === "OWNER";
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [sendingIntake, setSendingIntake] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [intakeMessage, setIntakeMessage] = useState<{
    clientId: string;
    type: "success" | "error" | "link";
    text: string;
    url?: string;
  } | null>(null);

  function loadClients() {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    fetch(`/api/clients${params}`)
      .then((r) => r.json())
      .then(setClients)
      .catch(() => setClients([]));
  }

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDeleteClient(clientId: string) {
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setIntakeMessage({ clientId, type: "error", text: data.error ?? "Failed to delete" });
        return;
      }
      setConfirmDelete(null);
      loadClients();
    } catch {
      setIntakeMessage({ clientId, type: "error", text: "Failed to delete client" });
    }
  }

  async function handleSendIntake(clientId: string) {
    setSendingIntake(clientId);
    setIntakeMessage(null);

    try {
      const res = await fetch("/api/clients/send-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIntakeMessage({ clientId, type: "error", text: data.error ?? "Failed to send" });
        return;
      }

      if (data.method === "email") {
        setIntakeMessage({ clientId, type: "success", text: "Intake form sent to their email" });
      } else {
        setIntakeMessage({
          clientId,
          type: "link",
          text: "Copy this link and send it to the client:",
          url: data.intakeUrl,
        });
      }
    } catch {
      setIntakeMessage({ clientId, type: "error", text: "Failed to send intake" });
    } finally {
      setSendingIntake(null);
    }
  }

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

      {/* Intake link message (shown above table when Resend is not configured) */}
      {intakeMessage?.type === "link" && intakeMessage.url && (
        <div className="mt-4 rounded-sm border border-figaro-teal/30 bg-figaro-teal/10 p-4">
          <p className="text-sm text-figaro-teal">{intakeMessage.text}</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={intakeMessage.url}
              className="w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-3 py-2 text-sm text-figaro-cream"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(intakeMessage.url ?? "");
                setIntakeMessage({ ...intakeMessage, text: "Link copied!" });
              }}
              className="shrink-0 rounded-sm bg-figaro-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-figaro-teal-dark"
            >
              Copy
            </button>
          </div>
        </div>
      )}

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
              {isOwner && (
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-figaro-gold/5">
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={isOwner ? 6 : 5}
                  className="px-4 py-8 text-center text-figaro-cream/40"
                >
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
                    {client.intakeCompleted ? (
                      <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-figaro-cream/20" />
                        {client.email && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleSendIntake(client.id)}
                              disabled={sendingIntake === client.id}
                              className="rounded-sm bg-figaro-gold/10 px-2.5 py-1 text-xs font-medium text-figaro-gold transition-colors hover:bg-figaro-gold/20 disabled:opacity-50"
                            >
                              {sendingIntake === client.id ? "Sending..." : "Send Intake"}
                            </button>
                            {intakeMessage?.clientId === client.id &&
                              intakeMessage.type === "success" && (
                                <span className="text-xs text-green-400">{intakeMessage.text}</span>
                              )}
                            {intakeMessage?.clientId === client.id &&
                              intakeMessage.type === "error" && (
                                <span className="text-xs text-red-400">{intakeMessage.text}</span>
                              )}
                          </>
                        )}
                      </div>
                    )}
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3 text-center">
                      {confirmDelete === client.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleDeleteClient(client.id)}
                            className="rounded-sm bg-red-500/20 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-sm px-2.5 py-1 text-xs text-figaro-cream/50 transition-colors hover:text-figaro-cream"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(client.id)}
                          className="rounded-sm bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
