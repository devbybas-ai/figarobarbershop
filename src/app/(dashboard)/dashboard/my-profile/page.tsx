"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface BarberProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  bio: string | null;
  imageUrl: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
}

export default function MyProfilePage() {
  const { data: session } = useSession();
  const [barber, setBarber] = useState<BarberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");

  useEffect(() => {
    if (!session?.user?.name) return;

    const firstName = session.user.name.split(" ")[0];
    if (!firstName) {
      setLoading(false);
      return;
    }

    fetch(`/api/barbers/${firstName.toLowerCase()}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data: BarberProfile) => {
        setBarber(data);
        setBio(data.bio ?? "");
        setPhone(data.phone ?? "");
        setImageUrl(data.imageUrl ?? "");
        setInstagram(data.instagram ?? "");
        setFacebook(data.facebook ?? "");
        setTiktok(data.tiktok ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  async function handleSave() {
    if (!barber) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/barbers/${barber.firstName.toLowerCase()}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, phone, imageUrl, instagram, facebook, tiktok }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }

      setMessage({ type: "success", text: "Profile updated!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-figaro-teal border-t-transparent" />
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="py-20 text-center">
        <p className="text-figaro-cream/60">No barber profile linked to your account.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-figaro-cream">My Profile</h2>
          <p className="mt-1 text-sm text-figaro-cream/50">
            Edit your bio, contact info, and social links. Your name is managed by the owner.
          </p>
        </div>
        <a
          href={`/barbers/${barber.firstName.toLowerCase()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-figaro-teal transition-colors hover:text-figaro-teal-light"
        >
          View public profile &rarr;
        </a>
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

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left column: Bio & Contact */}
        <div className="space-y-6">
          <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
            <h3 className="text-lg font-semibold text-figaro-cream">About You</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-figaro-cream/70">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={`${barber.firstName} ${barber.lastName}`}
                  disabled
                  className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-black/50 px-4 py-2.5 text-sm text-figaro-cream/40"
                />
                <p className="mt-1 text-xs text-figaro-cream/30">Name is set by the shop owner</p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-figaro-cream/70">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about yourself..."
                  className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                  maxLength={500}
                />
                <p className="mt-1 text-right text-xs text-figaro-cream/30">{bio.length}/500</p>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-figaro-cream/70">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(760) 555-0000"
                  className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
            <h3 className="text-lg font-semibold text-figaro-cream">Profile Image</h3>
            <p className="mt-1 text-sm text-figaro-cream/50">
              Provide a URL to your profile photo.
            </p>
            <div className="mt-4">
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
              />
            </div>
            {imageUrl && (
              <div className="mt-4">
                <div className="h-32 w-32 overflow-hidden rounded-sm border border-figaro-gold/10">
                  <img
                    src={imageUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Social Media */}
        <div className="space-y-6">
          <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
            <h3 className="text-lg font-semibold text-figaro-cream">Social Media</h3>
            <p className="mt-1 text-sm text-figaro-cream/50">
              Add your social handles so clients can follow your work.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="instagram"
                  className="block text-sm font-medium text-figaro-cream/70"
                >
                  Instagram
                </label>
                <div className="mt-1 flex items-center">
                  <span className="rounded-l-sm border border-r-0 border-figaro-gold/10 bg-figaro-black/50 px-3 py-2.5 text-sm text-figaro-cream/40">
                    @
                  </span>
                  <input
                    id="instagram"
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="username"
                    className="w-full rounded-r-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="facebook"
                  className="block text-sm font-medium text-figaro-cream/70"
                >
                  Facebook
                </label>
                <div className="mt-1 flex items-center">
                  <span className="rounded-l-sm border border-r-0 border-figaro-gold/10 bg-figaro-black/50 px-3 py-2.5 text-sm text-figaro-cream/40">
                    fb.com/
                  </span>
                  <input
                    id="facebook"
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="username"
                    className="w-full rounded-r-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="tiktok" className="block text-sm font-medium text-figaro-cream/70">
                  TikTok
                </label>
                <div className="mt-1 flex items-center">
                  <span className="rounded-l-sm border border-r-0 border-figaro-gold/10 bg-figaro-black/50 px-3 py-2.5 text-sm text-figaro-cream/40">
                    @
                  </span>
                  <input
                    id="tiktok"
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="username"
                    className="w-full rounded-r-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream placeholder:text-figaro-cream/30 focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-sm bg-figaro-gold px-6 py-3.5 text-base font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
