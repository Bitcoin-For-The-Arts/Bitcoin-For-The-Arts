import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { leadership } from '@/lib/leadership';

export function generateStaticParams() {
  return leadership.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const person = leadership.find((p) => p.slug === params.slug);
  if (!person) return { title: 'Leadership' };
  return {
    title: person.name,
    description: `${person.name} — ${person.title}`,
  };
}

export default function LeadershipProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const person = leadership.find((p) => p.slug === params.slug);
  if (!person) notFound();

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-5xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/about/leadership" className="hover:underline">
              Leadership
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">{person.name}</span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-border bg-surface/80 p-6 shadow-sm">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-background">
                  <Image
                    src={person.imageSrc}
                    alt={person.imageAlt}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                </div>
                <div className="mt-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {person.title}
                  </div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">
                    {person.name}
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/donate"
                    className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
                  >
                    Support the mission
                  </Link>
                  <Link
                    href="/about/leadership"
                    className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
                  >
                    Back to Leadership
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-border bg-background p-8">
                <div className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">
                  Full bio
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {person.name}
                </h1>
                <p className="mt-3 text-sm font-semibold text-muted">
                  {person.title}
                </p>

                <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
                  {person.fullBio.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-xl font-semibold tracking-tight">
                  Why this leadership matters
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Bitcoin For The Arts exists to protect creative freedom and fund
                  artists on sound money. Leadership is stewardship — our duty is to
                  serve artists, donors, and the mission with transparency, courage,
                  and long-term conviction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

