import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-xl">
        <div className="text-xs font-semibold uppercase tracking-wide text-black/60">
          404
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-black/70">
          The page you’re looking for doesn’t exist (or moved). Use the navigation
          above, or head back home.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/85"
          >
            Go to homepage
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md border border-black/15 px-6 py-3 text-sm font-semibold transition-colors hover:bg-black/5"
          >
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}

