import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// === RATE LIMIT CONFIGURATION ===

interface RateLimitRule {
  /** Max requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
  /** Prefix for the rate-limit key */
  keyPrefix: string;
}

const RATE_LIMITED_PATHS: Record<string, RateLimitRule> = {
  "/api/auth/callback/credentials": {
    limit: 5,
    windowMs: 60_000,
    keyPrefix: "login",
  },
  "/api/clients/intake": {
    limit: 10,
    windowMs: 60_000,
    keyPrefix: "intake",
  },
  "/api/appointments": {
    limit: 10,
    windowMs: 60_000,
    keyPrefix: "booking",
  },
};

// === ROUTE PROTECTION MIDDLEWARE ===

const PROTECTED_PATHS = ["/dashboard"];

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and internal Next.js requests
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // --- Rate limiting on POST to specific endpoints ---
  if (request.method === "POST") {
    const rule = RATE_LIMITED_PATHS[pathname];
    if (rule) {
      const ip = getClientIp(request);
      const result = rateLimit(`${rule.keyPrefix}:${ip}`, rule.limit, rule.windowMs);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Too many requests. Please try again later.",
            retryAfter: result.resetIn,
          },
          {
            status: 429,
            headers: { "Retry-After": String(result.resetIn) },
          },
        );
      }
    }
  }

  const isProtectedRoute = PROTECTED_PATHS.some((path) => pathname.startsWith(path));

  if (isProtectedRoute) {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ??
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === "/login") {
    const sessionToken =
      request.cookies.get("authjs.session-token")?.value ??
      request.cookies.get("__Secure-authjs.session-token")?.value;

    if (sessionToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // CSRF: Validate Origin on state-changing requests
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"],
};
