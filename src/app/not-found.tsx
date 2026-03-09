import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-figaro-cream px-4 text-center">
      <h1 className="mb-2 text-6xl font-bold text-figaro-gold">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-figaro-black">Page Not Found</h2>
      <p className="mb-8 max-w-md text-figaro-black/70">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-full bg-figaro-gold px-8 py-3 font-semibold text-white transition-colors hover:bg-figaro-gold-light"
      >
        Back to Home
      </Link>
    </main>
  );
}
