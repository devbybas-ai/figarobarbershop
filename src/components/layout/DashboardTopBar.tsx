"use client";

import { useSession } from "next-auth/react";
import { signOutAction } from "@/lib/auth-actions";

export function DashboardTopBar() {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "F";

  return (
    <header className="flex h-16 items-center justify-between border-b border-figaro-gold/10 bg-figaro-dark px-6">
      <div>
        <h1 className="text-lg font-semibold text-figaro-cream">Barbershop Administration</h1>
      </div>
      <div className="flex items-center gap-4">
        {session?.user && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium text-figaro-cream">{session.user.name}</p>
              <p className="text-xs text-figaro-cream/50">{session.user.role}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-figaro-gold text-sm font-bold text-figaro-dark">
              {initials}
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-sm text-figaro-cream/40 transition-colors hover:text-figaro-cream"
              >
                Sign out
              </button>
            </form>
          </>
        )}
      </div>
    </header>
  );
}
