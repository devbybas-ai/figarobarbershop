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
  const [uploading, setUploading] = useState(false);

  const isOwner = session?.user?.role === "OWNER";

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");

  useEffect(() => {
    if (!session?.user?.id) return;

    // Look up barber by userId — works regardless of display name
    fetch("/api/barbers")
      .then((r) => r.json())
      .then((barbers: (BarberProfile & { userId: string | null })[]) => {
        const match = barbers.find((b) => b.userId === session.user.id);
        if (match) {
          setBarber(match);
          setFirstName(match.firstName);
          setLastName(match.lastName);
          setBio(match.bio ?? "");
          setPhone(match.phone ?? "");
          setImageUrl(match.imageUrl ?? "");
          setInstagram(match.instagram ?? "");
          setFacebook(match.facebook ?? "");
          setTiktok(match.tiktok ?? "");
        }
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
        body: JSON.stringify({
          bio,
          phone,
          imageUrl,
          instagram,
          facebook,
          tiktok,
          ...(isOwner ? { firstName, lastName } : {}),
        }),
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
            {isOwner
              ? "You have full access to edit your profile."
              : "Edit your bio, contact info, and social links. Your name is managed by the owner."}
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
              {isOwner ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-figaro-cream/70"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-figaro-cream/70"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 w-full rounded-sm border border-figaro-gold/10 bg-figaro-dark px-4 py-2.5 text-sm text-figaro-cream focus:border-figaro-teal focus:ring-1 focus:ring-figaro-teal focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
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
              )}

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
            <h3 className="text-lg font-semibold text-figaro-cream">Profile Photo</h3>
            <p className="mt-1 text-sm text-figaro-cream/50">
              Upload a professional headshot or action shot of you cutting hair.
            </p>

            <div className="mt-4 flex gap-6">
              {/* Preview */}
              <div className="h-36 w-36 shrink-0 overflow-hidden rounded-sm border border-figaro-gold/10 bg-figaro-black">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-figaro-cream/20">
                    <svg
                      className="h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload area */}
              <div className="flex flex-1 flex-col justify-center">
                <label
                  htmlFor="profileUpload"
                  className={`flex cursor-pointer flex-col items-center rounded-sm border-2 border-dashed px-4 py-6 text-center transition-colors ${
                    uploading
                      ? "border-figaro-gold/30 bg-figaro-gold/5"
                      : "border-figaro-gold/20 hover:border-figaro-gold/40 hover:bg-figaro-gold/5"
                  }`}
                >
                  <svg
                    className="mb-2 h-8 w-8 text-figaro-cream/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <span className="text-sm font-medium text-figaro-cream/60">
                    {uploading ? "Uploading..." : "Click to upload photo"}
                  </span>
                  <span className="mt-1 text-xs text-figaro-cream/30">
                    JPG, PNG, WebP, or AVIF &middot; Max 5MB
                  </span>
                </label>
                <input
                  id="profileUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    setMessage(null);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      if (res.ok) {
                        const data: { imageUrl: string } = await res.json();
                        setImageUrl(data.imageUrl);
                        setMessage({
                          type: "success",
                          text: "Photo uploaded! Click Save Changes to keep it.",
                        });
                      } else {
                        const err = await res.json();
                        setMessage({ type: "error", text: err.error ?? "Upload failed" });
                      }
                    } catch {
                      setMessage({ type: "error", text: "Upload failed" });
                    } finally {
                      setUploading(false);
                      e.target.value = "";
                    }
                  }}
                />

                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-figaro-cream/40">Best results:</p>
                  <ul className="space-y-0.5 text-xs text-figaro-cream/30">
                    <li>&#8226; Square or portrait orientation (1:1 or 3:4)</li>
                    <li>&#8226; Good lighting, face clearly visible</li>
                    <li>&#8226; Action shots of you working look great</li>
                    <li>&#8226; Minimum 400x400px for sharp display</li>
                  </ul>
                </div>
              </div>
            </div>
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
