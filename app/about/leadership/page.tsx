import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { leadership } from '@/lib/leadership';

export const metadata: Metadata = {
  title: 'Leadership',
  description: 'Leadership at Bitcoin For The Arts.',
};

export default function LeadershipPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-5xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Leadership</span>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-surface/80 p-8 shadow-sm">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Leadership
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
              Bitcoin For The Arts is building a new patronage model for sovereign
              creators. As we grow, this page will expand to reflect the leaders
              stewarding the mission.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {leadership.map((p) => (
              <div
                key={p.slug}
                className="rounded-2xl border border-border bg-background p-6"
              >
                <div className="flex items-start gap-5">
                  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-border bg-surface">
                    <Image
                      src={p.imageSrc}
                      alt={p.imageAlt}
                      fill
                      className="object-cover object-center"
                      sizes="96px"
                    />
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/about/leadership/${p.slug}`}
                      className="text-lg font-semibold tracking-tight hover:underline"
                    >
                      {p.name}
                    </Link>
                    <div className="mt-1 text-sm font-semibold text-muted">
                      {p.title}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {p.shortBio}
                    </p>
                    <div className="mt-5">
                      <Link
                        href={`/about/leadership/${p.slug}`}
                        className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                      >
                        View full bio
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
            >
              Back to About
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

