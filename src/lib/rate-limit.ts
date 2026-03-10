// === IN-MEMORY SLIDING-WINDOW RATE LIMITER ===
// Edge-compatible (no Node.js APIs). For multi-instance deployments, use Redis.

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Track last cleanup time for lazy cleanup
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 300_000; // 5 minutes

/**
 * Lazy cleanup: purge stale entries when enough time has passed.
 * Called on each rateLimit invocation instead of setInterval (Edge-safe).
 */
function lazyCleanup(maxAgeMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;

  lastCleanup = now;
  const cutoff = now - maxAgeMs * 2; // 2x window as safety margin

  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  /** Seconds until the oldest request in the window expires (0 if not limited) */
  resetIn: number;
}

/**
 * Check and record a rate-limit hit.
 *
 * @param key     Unique identifier (e.g. "login:<ip>")
 * @param limit   Max requests allowed in the window
 * @param windowMs  Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // Lazy cleanup on each call
  lazyCleanup(windowMs);

  const entry = store.get(key) ?? { timestamps: [] };

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0]!;
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((oldest + windowMs - now) / 1000),
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    success: true,
    remaining: limit - entry.timestamps.length,
    resetIn: 0,
  };
}
