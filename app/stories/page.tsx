import type { Metadata } from 'next';
import Link from 'next/link';
import ArtistStoryInvitationForm from '@/components/ArtistStoryInvitationForm';

export const metadata: Metadata = {
  title: 'Artist Stories',
  description:
    'Share your Bitcoin journey and artistic evolution with Bitcoin For The Arts.',
};

const interviewFormats = [
  {
    title: 'Video interview',
    detail:
      'A recorded conversation via Zoom or similar platform (typically 30-60 minutes).',
  },
  {
    title: 'Audio interview',
    detail:
      'A podcast-style discussion focused on your voice, process, and ideas (30-60 minutes).',
  },
  {
    title: 'Written interview',
    detail:
      'A question set completed by email or form, edited into a feature for site and newsletter.',
  },
] as const;

const storyPrompts = [
  'How you discovered Bitcoin, and key breakthroughs or challenges on your journey.',
  'What drives your creative process, and how your work expresses sovereignty.',
  'How Bitcoin has influenced your mindset around creativity, independence, and value.',
] as const;

export default function StoriesPage() {
  const artistStoriesEmail = 'artist@bitcoinforthearts.org';

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <section className="max-w-4xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Artist Stories • Open call
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Share your Bitcoin journey and artistic evolution.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            Bitcoin For The Arts, Inc., a 501(c)(3) nonprofit, invites sovereign
            creators across visual arts, theater, dance, music, writing,
            storytelling, film, and interdisciplinary practices to share their lived
            experience at the intersection of Bitcoin and creative work.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            We believe sound money is helping artists build long-term creative
            freedom. Your story can help inspire fellow creators, patrons, and
            communities navigating this transition.
          </p>
        </section>

        <div className="mt-8 rounded-2xl border border-accent/40 bg-surface/80 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Call for submissions
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Selected stories may be featured in our Artist Stories section and
            newsletter. We currently respond within approximately 7-10 business days.
          </p>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight">Choose your format</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {interviewFormats.map((format) => (
              <div
                key={format.title}
                className="rounded-2xl border border-border bg-background p-5"
              >
                <div className="text-sm font-semibold tracking-tight">
                  {format.title}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {format.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7 rounded-2xl border border-border bg-surface/70 p-6">
            <h2 className="text-xl font-semibold tracking-tight">
              Tell us your story
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Use this form to share your background and preferred interview format.
            </p>
            <div className="mt-5">
              <ArtistStoryInvitationForm />
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                What we are looking for
              </div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
                {storyPrompts.map((prompt) => (
                  <li key={prompt}>{prompt}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                Prefer email?
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Send a short introduction, your artistic background, and your
                preferred interview format to{' '}
                <a
                  className="font-semibold underline underline-offset-4"
                  href={`mailto:${artistStoriesEmail}?subject=Artist%20Story%20Submission`}
                >
                  {artistStoriesEmail}
                </a>
                .
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Response target: 7-10 business days.
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-background p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-xl font-semibold tracking-tight">
                Help us amplify sovereign creators
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Storytelling is part of our mission: document real creative journeys,
                strengthen community, and expand artist sovereignty through Bitcoin.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <Link
                href="/donate/monthly"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-2 text-sm font-semibold transition-colors hover:opacity-90"
              >
                Support the mission
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

