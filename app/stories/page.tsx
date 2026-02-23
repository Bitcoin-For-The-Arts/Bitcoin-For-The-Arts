import StoryEntry from "@/components/StoryEntry";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stories",
  description: "Stories and updates from Bitcoin for the Arts.",
};

function QuoteCard({
  quote,
  attribution,
  wide = false,
}: {
  quote: string;
  attribution: string;
  wide?: boolean;
}) {
  return (
    <figure
      className={[
        "relative overflow-hidden rounded-2xl border border-accent/25 bg-surface/70 p-6 shadow-sm transition-all",
        "hover:shadow-md hover:border-accent/40",
        wide ? "md:col-span-2" : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,147,26,0.14),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(126,87,194,0.12),transparent_55%)]" />
      <div className="relative">
        <blockquote className="text-base leading-relaxed text-foreground/90 italic font-[var(--font-display)]">
          “{quote}”
        </blockquote>
        <figcaption className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent/80" aria-hidden="true" />
          {attribution}
        </figcaption>
      </div>
    </figure>
  );
}

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

            <div className="mt-8 rounded-2xl border border-accent/40 bg-surface/80 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                Artist story invitation
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Want to be featured? Share your Bitcoin journey and artistic evolution with our team.
              </p>
              <div className="mt-4">
                <Link
                  href="/stories/share-your-story"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
                >
                  Share your story
                </Link>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <QuoteCard
                quote="3/5s of a new sound bag, craft services and wardrobe for an indie film, or 1/3 of a camera."
                attribution="FuzzyNibs • Nostr"
              />
              <QuoteCard
                quote="$500 would unlock a week to focus on recording and producing music instead of the casual work I need to cover bills…"
                attribution="Matt Finlay • Nostr"
              />
              <QuoteCard
                quote="Right now, I’m applying for juried art fair booths — $500 to $1,500 depending on the city/venue. I do 15–20 a year and pay 4–6 months in advance. The grant would help alleviate financial stress. Paying for shows and travel is my biggest expense."
                attribution="unit • Nostr"
              />
              <QuoteCard
                quote="I would adopt an alpaca at the farm down the street… they shear in May and you get the wool. I’d use the felt to make insulation for my mittens — plus fabric, materials, a heat press, and dies to make more sizes."
                attribution="sunavaunt • Nostr"
              />
              <QuoteCard
                quote="For any of our artists, that would unlock a good chunk of studio time to record a handful of tracks. If the opportunity arose and the stars aligned for a show or tour, that would cover most of travel/lodging."
                attribution="Hash Power Music • Nostr"
                wide
              />
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

