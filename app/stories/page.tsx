import StoryEntry from "@/components/StoryEntry";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stories",
  description: "Stories and updates from Bitcoin for the Arts.",
};

export default function StoriesPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <section className="mb-10">
          <div className="max-w-4xl">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Spotlight • What micro-grants unlock
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              “What would a $500–$2,000 Bitcoin-native micro-grant unlock in 30 days?”
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
              We asked artists on Nostr. These responses are practical, specific, and exactly why small grants matter:
              time, materials, travel, studio sessions, and the ability to say “yes” to opportunities.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <figure className="rounded-2xl border border-border bg-background p-6">
                <blockquote className="text-sm leading-relaxed text-muted">
                  “3/5s of a new sound bag, craft services and wardrobe for an indie film, or 1/3 of a camera.”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  FuzzyNibs • Nostr
                </figcaption>
              </figure>

              <figure className="rounded-2xl border border-border bg-background p-6">
                <blockquote className="text-sm leading-relaxed text-muted">
                  “$500 would unlock a week to focus on recording and producing music instead of the casual work I need
                  to cover bills…”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  Matt Finlay • Nostr
                </figcaption>
              </figure>

              <figure className="rounded-2xl border border-border bg-background p-6">
                <blockquote className="text-sm leading-relaxed text-muted">
                  “Right now, I’m applying for juried art fair booths — $500 to $1,500 depending on the city/venue. I do
                  15–20 a year and pay 4–6 months in advance. The grant would help alleviate financial stress. Paying for
                  shows and travel is my biggest expense.”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  unit • Nostr
                </figcaption>
              </figure>

              <figure className="rounded-2xl border border-border bg-background p-6">
                <blockquote className="text-sm leading-relaxed text-muted">
                  “I would adopt an alpaca at the farm down the street… they shear in May and you get the wool. I’d use
                  the felt to make insulation for my mittens — plus fabric, materials, a heat press, and dies to make
                  more sizes.”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  sunavaunt • Nostr
                </figcaption>
              </figure>

              <figure className="rounded-2xl border border-border bg-background p-6 md:col-span-2">
                <blockquote className="text-sm leading-relaxed text-muted">
                  “For any of our artists, that would unlock a good chunk of studio time to record a handful of tracks.
                  If the opportunity arose and the stars aligned for a show or tour, that would cover most of
                  travel/lodging.”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  Hash Power Music • Nostr
                </figcaption>
              </figure>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/donate"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                Fund micro-grants
              </Link>
              <Link
                href="/grants"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface"
              >
                Learn about grants
              </Link>
            </div>
          </div>
        </section>

        <StoryEntry
          title="FANTASTIC CAT, THE BAND THAT LIVES UP TO THE NAME"
          subtitle="TOPIC DISCUSSION"
          isFirst
        />
        <StoryEntry
          title="A FANTASTIC CAT OFFICE HOLIDAY PARTY AT THE BOWERY BALLROOM"
          subtitle="TOPIC DISCUSSION"
          reverse
        />
        <StoryEntry
          title="A MIAMI BREEZE, PROJECTOR SCREENS, AND NFTS"
          subtitle="BITCOIN FOR ARTS UPDATES"
        />
      </div>
    </main>
  );
}

