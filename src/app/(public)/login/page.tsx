"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-figaro-cream px-4">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-figaro-black">Barbershop Administration</h2>
          <p className="mt-2 text-sm text-figaro-black/60">
            Sign in to Figaro Barbershop dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div
              className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-figaro-black">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black placeholder:text-figaro-black/40 focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
              placeholder="owner@figaroleucadia.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-figaro-black">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-figaro-black/20 bg-white px-3 py-2.5 text-figaro-black placeholder:text-figaro-black/40 focus:border-figaro-gold focus:outline-none focus:ring-1 focus:ring-figaro-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-figaro-gold px-4 py-2.5 text-sm font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
