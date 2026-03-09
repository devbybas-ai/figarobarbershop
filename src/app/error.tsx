"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-figaro-cream px-4 text-center">
      <h1 className="mb-2 text-4xl font-bold text-figaro-black">Something went wrong</h1>
      <p className="mb-8 max-w-md text-figaro-black/70">
        {error.digest ? `Error reference: ${error.digest}` : "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="rounded-full bg-figaro-teal px-8 py-3 font-semibold text-white transition-colors hover:bg-figaro-teal-dark"
      >
        Try Again
      </button>
    </main>
  );
}
