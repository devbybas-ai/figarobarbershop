"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Dashboard Error</h1>
      <p className="mb-6 max-w-md text-gray-600">
        {error.digest
          ? `Error reference: ${error.digest}`
          : "Something went wrong loading this page."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-figaro-teal px-6 py-2 font-medium text-white transition-colors hover:bg-figaro-teal-dark"
      >
        Try Again
      </button>
    </div>
  );
}
