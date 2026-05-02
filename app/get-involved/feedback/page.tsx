import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import FeedbackForm from '@/components/FeedbackForm';

export const metadata: Metadata = {
  title: 'Feedback',
  description:
    'Share feedback to help Bitcoin For The Arts improve grants, workshops, and community support.',
};

export default function FeedbackPage() {
  const feedbackEmail = (process.env.FEEDBACK_TO_EMAIL ?? 'feedback@bitcoinforthearts.org').trim();
  return (
    <main className="bg-background relative overflow-hidden min-h-screen">
      <div className="pointer-events-none absolute inset-0">
        <Image
          src="/Get%20Involved%20-background.jpg"
          alt=""
          fill
          priority={false}
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-background/65" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Link href="/get-involved" className="hover:underline">
              Get involved
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Feedback</span>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-surface/80 p-8 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Feedback survey
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              BFTA Feedback
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted sm:text-lg">
              Your input helps us ignite the arts renaissance on sound money. This takes ~2 minutes.
              Anonymous options are available.
            </p>

            <div className="mt-8">
              <FeedbackForm />
            </div>
          </div>

          <div className="mt-6 text-xs text-muted">
            Prefer email?{' '}
            <a
              href={`mailto:${feedbackEmail}?subject=BFTA%20feedback`}
              className="font-semibold underline underline-offset-4"
            >
              {feedbackEmail}
            </a>
            .
          </div>
        </div>
      </div>
    </main>
  );
}

