"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Barber {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  bio: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  commissionRate: string;
  isActive: boolean;
}

export default function BarbersPage() {
  const { data: session } = useSession();
  const isOwner = session?.user?.role === "OWNER";

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<string | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    commissionRate: "",
    instagram: "",
    facebook: "",
    tiktok: "",
  });

  function startEdit(barber: Barber) {
    setEditingId(barber.id);
    setEditForm({
      firstName: barber.firstName,
      lastName: barber.lastName,
      phone: barber.phone ?? "",
      bio: barber.bio ?? "",
      commissionRate: String(Number(barber.commissionRate)),
      instagram: barber.instagram ?? "",
      facebook: barber.facebook ?? "",
      tiktok: barber.tiktok ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleEditSave(barber: Barber) {
    setEditSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/barbers/${barber.firstName.toLowerCase()}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          phone: editForm.phone,
          bio: editForm.bio,
          commissionRate: Number(editForm.commissionRate),
          instagram: editForm.instagram,
          facebook: editForm.facebook,
          tiktok: editForm.tiktok,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }

      setMessage({ type: "success", text: `${editForm.firstName}'s profile updated!` });
      setEditingId(null);
      loadBarbers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setEditSaving(false);
    }
  }

  // Add barber form
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCommission, setNewCommission] = useState("45");

  function loadBarbers() {
    fetch("/api/barbers")
      .then((r) => r.json())
      .then(setBarbers)
      .catch(() => setBarbers([]));
  }

  useEffect(() => {
    loadBarbers();
  }, []);

  async function handleAddBarber() {
    if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim()) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/barbers/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: newFirstName.trim(),
          lastName: newLastName.trim(),
          email: newEmail.trim(),
          phone: newPhone.trim() || null,
          commissionRate: Number(newCommission),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to add barber");
      }

      setMessage({
        type: "success",
        text: `${newFirstName} added! Share the temporary password with them directly.`,
      });
      setShowAddForm(false);
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPhone("");
      setNewCommission("45");
      loadBarbers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to add" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(barberId: string) {
    setMessage(null);
    try {
      const res = await fetch(`/api/barbers/manage?id=${barberId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to deactivate");
      }
      setMessage({ type: "success", text: "Barber deactivated" });
      setConfirmDeactivate(null);
      loadBarbers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    }
  }

  async function handleReactivate(barberId: string) {
    setMessage(null);
    try {
      const res = await fetch("/api/barbers/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: barberId, isActive: true }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to reactivate");
      }
      setMessage({ type: "success", text: "Barber reactivated" });
      loadBarbers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed" });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-figaro-cream">Barbers &amp; Stylists</h2>
        {isOwner && (
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-sm bg-figaro-gold px-5 py-2.5 text-sm font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light"
          >
            {showAddForm ? "Cancel" : "+ Add Barber"}
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mt-4 rounded-sm border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add Barber Form (Owner Only) */}
      {showAddForm && isOwner && (
        <div className="mt-6 rounded-sm border border-figaro-teal/20 bg-figaro-dark p-6">
          <h3 className="text-lg font-semibold text-figaro-cream">Add New Barber</h3>
          <p className="mt-1 text-sm text-figaro-cream/50">
            Creates a user account with a temporary password (set via environment config)
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="addFirstName"
                className="block text-sm font-medium text-figaro-cream/70"
              >
                First Name *
              </label>
              <input
                id="addFirstName"
                type="text"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="addLastName"
                className="block text-sm font-medium text-figaro-cream/70"
              >
                Last Name *
              </label>
              <input
                id="addLastName"
                type="text"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="addEmail" className="block text-sm font-medium text-figaro-cream/70">
                Email * (for login)
              </label>
              <input
                id="addEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="addPhone" className="block text-sm font-medium text-figaro-cream/70">
                Phone
              </label>
              <input
                id="addPhone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="addCommission"
                className="block text-sm font-medium text-figaro-cream/70"
              >
                Commission Rate (%)
              </label>
              <input
                id="addCommission"
                type="number"
                min="0"
                max="100"
                value={newCommission}
                onChange={(e) => setNewCommission(e.target.value)}
                className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleAddBarber}
              disabled={saving || !newFirstName.trim() || !newLastName.trim() || !newEmail.trim()}
              className="rounded-sm bg-figaro-teal px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-figaro-teal-dark disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Barber"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className={`rounded-sm border p-6 ${
              barber.isActive
                ? "border-figaro-gold/10 bg-figaro-dark"
                : "border-red-500/10 bg-figaro-dark/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-figaro-gold/20 text-lg font-bold text-figaro-gold">
                {barber.firstName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-figaro-cream">
                  {barber.firstName} {barber.lastName}
                </h3>
                <span className={`text-xs ${barber.isActive ? "text-green-400" : "text-red-400"}`}>
                  {barber.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            {barber.bio && (
              <p className="mt-4 text-sm leading-relaxed text-figaro-cream/60">{barber.bio}</p>
            )}

            {(barber.instagram || barber.facebook || barber.tiktok) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {barber.instagram && (
                  <span className="rounded-full bg-figaro-teal/10 px-2.5 py-1 text-xs text-figaro-teal">
                    @{barber.instagram}
                  </span>
                )}
                {barber.facebook && (
                  <span className="rounded-full bg-figaro-gold/10 px-2.5 py-1 text-xs text-figaro-gold">
                    fb/{barber.facebook}
                  </span>
                )}
                {barber.tiktok && (
                  <span className="rounded-full bg-figaro-cream/10 px-2.5 py-1 text-xs text-figaro-cream/60">
                    @{barber.tiktok}
                  </span>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-figaro-gold/10 pt-4">
              <span className="text-sm text-figaro-cream/50">{barber.phone ?? "No phone"}</span>
              <span className="text-sm font-medium text-figaro-gold">
                {Number(barber.commissionRate)}% commission
              </span>
            </div>

            {isOwner && (
              <div className="mt-4 border-t border-figaro-gold/10 pt-4">
                {confirmDeactivate === barber.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400">Are you sure?</span>
                    <button
                      type="button"
                      onClick={() => handleDeactivate(barber.id)}
                      className="rounded-sm bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                    >
                      Yes, Deactivate
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeactivate(null)}
                      className="rounded-sm px-3 py-1.5 text-xs text-figaro-cream/50 transition-colors hover:text-figaro-cream"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <a
                      href={`/barbers/${barber.firstName.toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm bg-figaro-teal/10 px-3 py-1.5 text-xs font-medium text-figaro-teal transition-colors hover:bg-figaro-teal/20"
                    >
                      View Profile
                    </a>
                    <button
                      type="button"
                      onClick={() => (editingId === barber.id ? cancelEdit() : startEdit(barber))}
                      className="rounded-sm bg-figaro-gold/10 px-3 py-1.5 text-xs font-medium text-figaro-gold transition-colors hover:bg-figaro-gold/20"
                    >
                      {editingId === barber.id ? "Cancel Edit" : "Edit"}
                    </button>
                    {barber.isActive ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDeactivate(barber.id)}
                        className="rounded-sm bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReactivate(barber.id)}
                        className="rounded-sm bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Inline Edit Form */}
            {editingId === barber.id && isOwner && (
              <div className="mt-4 border-t border-figaro-gold/10 pt-4">
                <h4 className="mb-3 text-sm font-semibold text-figaro-cream">Edit Profile</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor={`edit-fn-${barber.id}`}
                      className="block text-xs font-medium text-figaro-cream/60"
                    >
                      First Name
                    </label>
                    <input
                      id={`edit-fn-${barber.id}`}
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-3 py-2 text-sm text-figaro-cream focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`edit-ln-${barber.id}`}
                      className="block text-xs font-medium text-figaro-cream/60"
                    >
                      Last Name
                    </label>
                    <input
                      id={`edit-ln-${barber.id}`}
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-3 py-2 text-sm text-figaro-cream focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`edit-phone-${barber.id}`}
                      className="block text-xs font-medium text-figaro-cream/60"
                    >
                      Phone
                    </label>
                    <input
                      id={`edit-phone-${barber.id}`}
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="(760) 555-0000"
                      className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-3 py-2 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`edit-comm-${barber.id}`}
                      className="block text-xs font-medium text-figaro-cream/60"
                    >
                      Commission (%)
                    </label>
                    <input
                      id={`edit-comm-${barber.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.commissionRate}
                      onChange={(e) => setEditForm({ ...editForm, commissionRate: e.target.value })}
                      className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-3 py-2 text-sm text-figaro-cream focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label
                    htmlFor={`edit-bio-${barber.id}`}
                    className="block text-xs font-medium text-figaro-cream/60"
                  >
                    Bio
                  </label>
                  <textarea
                    id={`edit-bio-${barber.id}`}
                    rows={3}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Tell clients about this barber..."
                    maxLength={500}
                    className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-3 py-2 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor={`edit-ig-${barber.id}`}
                      className="block text-xs font-medium text-figaro-cream/60"
                    >
                      Instagram
                    </label>
                    <input
                      id={`edit-ig-${barber.id}`}
                      type="text"
                      value={editForm.instagram}
                      onChange={(e) => setEditForm({ ...editForm, instagram: e.target.value })}
                      placeholder="@handle"
                      className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-3 py-2 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`edit-fb-${barber.id}`}
                      className="block text-xs font-medium text-figaro-cream/60"
                    >
                      Facebook
                    </label>
                    <input
                      id={`edit-fb-${barber.id}`}
                      type="text"
                      value={editForm.facebook}
                      onChange={(e) => setEditForm({ ...editForm, facebook: e.target.value })}
                      placeholder="username"
                      className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-3 py-2 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`edit-tt-${barber.id}`}
                      className="block text-xs font-medium text-figaro-cream/60"
                    >
                      TikTok
                    </label>
                    <input
                      id={`edit-tt-${barber.id}`}
                      type="text"
                      value={editForm.tiktok}
                      onChange={(e) => setEditForm({ ...editForm, tiktok: e.target.value })}
                      placeholder="@handle"
                      className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-3 py-2 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditSave(barber)}
                    disabled={editSaving || !editForm.firstName.trim() || !editForm.lastName.trim()}
                    className="rounded-sm bg-figaro-gold px-4 py-2 text-xs font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
                  >
                    {editSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-sm px-4 py-2 text-xs text-figaro-cream/50 transition-colors hover:text-figaro-cream"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
