import FramedImage from "@/components/FramedImage";
import StoryEntry from "@/components/StoryEntry";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Artist Stories | Bitcoin for the Arts",
  description:
    "Sovereign journeys in Bitcoin and creativity — episodes, articles, and artist spotlights from Bitcoin for the Arts.",
};

/* ------------------------------------------------------------------ */
/*  DATA — Add new episodes & articles here to grow the gallery.      */
/*  Each object renders automatically in the appropriate section.     */
/* ------------------------------------------------------------------ */

type Episode = {
  type: "episode";
  title: string;
  summary: string;
  thumbnail: string;
  link: string;
};

type Article = {
  type: "article";
  title: string;
  teaser: string;
  byline: string;
  images: { src: string; alt: string; caption: string }[];
  link: string;
};

type StoryItem = Episode | Article;

const storiesData: StoryItem[] = [
  {
    type: "episode",
    title:
      "Share Your Bitcoin Journey: Episode 1 – Andrea Arghinenti\u2019s Sovereign Renaissance",
    summary:
      "Dive into the inaugural episode of Bitcoin For The Arts\u2019 \u201CShare Your Bitcoin Journey\u201D series, featuring visionary artist Andrea Arghinenti. As a pioneering 3D/VFX creator and early Bitcoin adopter, Andrea shares how BTC transformed his creative path\u2014from escaping fiat gatekeepers to embracing financial sovereignty and low-time-preference artistry. Discover his \u201Caha\u201D moments, the challenges of integrating decentralized tools into visual storytelling, and why Bitcoin is fueling a cultural renaissance for independent creators.\n\nThis episode kicks off our open-licensed series, highlighting artists stacking culture on sound money. Watch now to get orange-pilled on the intersection of art and Bitcoin!",
    thumbnail: "/BFTA-story-Ep1.PNG",
    link: "https://youtube.com/watch?v=4oKXPZeXbYg",
  },
  {
    type: "article",
    title:
      "Kenneth Burris \u2013 Sovereign Strokes in the Shadow of Cooling Towers",
    teaser:
      "In an era where digital ephemera floods our screens and AI churns out infinite images, Kenneth Burris stands as a defiant sentinel of permanence. This New York-based oil painter, with over three decades of studio mastery, doesn\u2019t merely create art; he forges it as a bulwark against the fleeting. His Post-Globalist Landscape series, where industrial behemoths like cooling towers loom amid misty wildernesses, provokes a visceral question: What endures when empires of code crumble?",
    byline: "By Eliza Thornberry, Art Critic for The New York Times",
    images: [
      {
        src: "/Alone_Oil on canvas_24x36inches.jpg",
        alt: "Alone by Kenneth Burris — oil on canvas",
        caption: "Alone, Oil on canvas, 24 \u00d7 36 inches",
      },
      {
        src: "/Moist Still Water_Oil on canvas_24x36inches.jpg",
        alt: "Moist Still Water by Kenneth Burris — oil on canvas",
        caption:
          "Moist Still Water (Landscape with Poles), Oil on canvas, 24 \u00d7 36 in, 2026",
      },
      {
        src: "/Coastal Sea Shore_OIl on canvas_11x14inches.jpg",
        alt: "Coastal Sea Shore by Kenneth Burris — oil on canvas",
        caption:
          "Coastal Sea Shore (Moss-covered), Oil on canvas, 11 \u00d7 14 in, 2025",
      },
    ],
    link: "/stories/kenneth-burris",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

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
          &ldquo;{quote}&rdquo;
        </blockquote>
        <figcaption className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
          <span
            className="h-1.5 w-1.5 rounded-full bg-accent/80"
            aria-hidden="true"
          />
          {attribution}
        </figcaption>
      </div>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function StoriesPage() {
  const episodes = storiesData.filter(
    (s): s is Episode => s.type === "episode",
  );
  const articles = storiesData.filter(
    (s): s is Article => s.type === "article",
  );

  return (
    <main className="min-h-screen bg-background">
      {/* ============================================================ */}
      {/*  HERO HEADER                                                 */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#7e57c2]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.04) 2px,rgba(255,255,255,0.04) 4px)",
              "repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(255,255,255,0.04) 2px,rgba(255,255,255,0.04) 4px)",
            ].join(","),
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
          <div className="mx-auto inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90">
            Bitcoin for the Arts
          </div>
          <h1 className="mx-auto mt-5 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Artist Stories
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80 sm:text-xl font-[var(--font-display)] italic">
            Sovereign Journeys in Bitcoin and Creativity
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SPOTLIGHT — MICRO-GRANT QUOTE CARDS                         */}
      {/* ============================================================ */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-4xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Spotlight &bull; What micro-grants unlock
          </div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            &ldquo;What would a $500&ndash;$2,000 Bitcoin-native micro-grant
            unlock in 30&nbsp;days?&rdquo;
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
            We asked artists on Nostr. These responses are practical, specific,
            and exactly why small grants matter: time, materials, travel, studio
            sessions, and the ability to say &ldquo;yes&rdquo; to
            opportunities.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            <QuoteCard
              quote="3/5s of a new sound bag, craft services and wardrobe for an indie film, or 1/3 of a camera."
              attribution="FuzzyNibs \u2022 Nostr"
            />
            <QuoteCard
              quote="$500 would unlock a week to focus on recording and producing music instead of the casual work I need to cover bills\u2026"
              attribution="Matt Finlay \u2022 Nostr"
            />
            <QuoteCard
              quote="Right now, I\u2019m applying for juried art fair booths \u2014 $500 to $1,500 depending on the city/venue. I do 15\u201320 a year and pay 4\u20136 months in advance. The grant would help alleviate financial stress. Paying for shows and travel is my biggest expense."
              attribution="unit \u2022 Nostr"
            />
            <QuoteCard
              quote="I would adopt an alpaca at the farm down the street\u2026 they shear in May and you get the wool. I\u2019d use the felt to make insulation for my mittens \u2014 plus fabric, materials, a heat press, and dies to make more sizes."
              attribution="sunavaunt \u2022 Nostr"
            />
            <QuoteCard
              quote="For any of our artists, that would unlock a good chunk of studio time to record a handful of tracks. If the opportunity arose and the stars aligned for a show or tour, that would cover most of travel/lodging."
              attribution="Hash Power Music \u2022 Nostr"
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

      {/* ============================================================ */}
      {/*  FEATURED EPISODES                                           */}
      {/* ============================================================ */}
      <section className="bg-gradient-to-b from-surface/60 via-background to-surface/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted">
            Featured Episodes
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Share Your Bitcoin Journey
          </h2>

          <div className="mt-10 flex flex-col gap-10">
            {episodes.map((ep) => (
              <a
                key={ep.link}
                href={ep.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-2xl border-2 border-[#d4af37] bg-background shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_12px_40px_rgba(212,175,55,0.2)]"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden lg:aspect-auto lg:w-[480px]">
                    <Image
                      src={ep.thumbnail}
                      alt={ep.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 480px"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/20">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f7931a] shadow-lg transition-transform duration-300 group-hover:scale-110">
                        <svg
                          className="ml-1 h-7 w-7 text-white"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="flex flex-1 flex-col justify-center p-6 lg:p-8">
                    <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      Episode 1
                    </div>
                    <h3 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
                      {ep.title}
                    </h3>
                    <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted sm:text-base">
                      {ep.summary.split("\n\n").map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                      Watch on YouTube
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  ARTIST GALLERY                                              */}
      {/* ============================================================ */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted">
            Artist Gallery
          </div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Featured Artists &amp; Articles
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-10">
            {articles.map((article) => (
              <div
                key={article.link}
                className="overflow-hidden rounded-2xl border border-border bg-surface/50 shadow-sm"
              >
                {/* Paintings mini-gallery */}
                <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-3 sm:p-8">
                  {article.images.map((img) => (
                    <FramedImage
                      key={img.src}
                      src={img.src}
                      alt={img.alt}
                      caption={img.caption}
                    />
                  ))}
                </div>

                {/* Article teaser */}
                <div className="border-t border-border px-6 py-6 sm:px-8">
                  <Link href={article.link} className="group block">
                    <h3 className="text-xl font-bold tracking-tight transition-colors group-hover:text-accent sm:text-2xl">
                      {article.title}
                    </h3>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted">
                      {article.byline}
                    </p>
                    <p className="mt-4 text-base leading-relaxed text-muted line-clamp-3">
                      {article.teaser}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                      Read full article
                      <svg
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PAST STORIES                                                */}
      {/* ============================================================ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted">
            Archive
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Past Stories
          </h2>

          <div className="mt-6">
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
        </div>
      </section>

      {/* ============================================================ */}
      {/*  GALLERY WINGS — STORY INVITATION + NEWSLETTER               */}
      {/* ============================================================ */}
      <section className="border-t border-[#d4af37]/30 bg-gradient-to-b from-[#7e57c2]/[0.04] to-background">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Left wing — Story invitation */}
            <div className="rounded-2xl border border-[#d4af37]/40 bg-surface/80 p-6 shadow-sm sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
                Share Your Story
              </div>
              <h3 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
                Help Artists Learn Through Real Experience
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Help us teach artists about Bitcoin through real lived
                experience. Share your Bitcoin journey and artistic evolution so
                other creators can learn, grow, and build sovereignty with
                confidence.
              </p>
              <div className="mt-6">
                <Link
                  href="/stories/share-your-story"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-[#d4af37] bg-transparent px-5 py-2 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
                >
                  Share your story and help artists
                </Link>
              </div>
            </div>

            {/* Right wing — Newsletter & Community */}
            <div className="rounded-2xl border border-[#d4af37]/40 bg-surface/80 p-6 shadow-sm sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
                Stay Connected
              </div>
              <h3 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
                News, Grants &amp; Events
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Get occasional updates on grants, programming, and events.
                Subscribe to our newsletter or follow us on Nostr to stay in the
                loop.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/donate"
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                >
                  Support the arts
                </Link>
                <Link
                  href="/get-involved"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-[#d4af37] bg-transparent px-5 py-2 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
                >
                  Get involved
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
