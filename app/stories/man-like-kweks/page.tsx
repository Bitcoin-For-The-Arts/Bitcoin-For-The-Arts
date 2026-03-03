import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Man Like Kweks – Rhythms of Rebellion from Kilimanjaro to the Timechain | Bitcoin for the Arts",
  description:
    "Man Like Kweks, a Tanzanian musician and Bitcoin educator, fuses Afrobeat rhythms with Lightning-fast zaps, transforming sound waves into sovereign anthems.",
};

export default function ManLikeKweksPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#7e57c2] to-[#4a148c]">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.04) 2px,rgba(255,255,255,0.04) 4px)",
              "repeating-linear-gradient(90deg,transparent,transparent 2px,rgba(255,255,255,0.04) 2px,rgba(255,255,255,0.04) 4px)",
            ].join(","),
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-16 sm:py-24">
          <Link
            href="/stories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 transition-colors hover:text-white"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Back to Stories
          </Link>

          <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-4 border-[#d4af37] shadow-lg sm:h-40 sm:w-40">
              <Image
                src="/Man-Like-Kweks.webp"
                alt="Man Like Kweks"
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Man Like Kweks
              </h1>
              <p className="mt-2 text-lg text-white/70 font-[var(--font-display)] italic">
                Rhythms of Rebellion from Kilimanjaro to the Timechain
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-white/50">
                Bitcoin For The Arts, Inc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width illustration banner */}
      <div className="relative h-64 w-full overflow-hidden sm:h-80 lg:h-96">
        <Image
          src="/Man-like-kweks-cartoon-profile.jpg"
          alt="Man Like Kweks — illustrated profile"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Article body */}
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <div className="prose-article">
          <p>
            In the pulsating heart of Tanzania&rsquo;s Bitcoin frontier, where
            Mount Kilimanjaro&rsquo;s snow-capped peaks pierce the sky like a
            defiant HODL against fiat&rsquo;s fleeting storms, Man Like Kweks
            crafts sonic manifestos that echo across continents. This visionary
            musician, community educator, and Christian&mdash;whose work weaves
            Bitcoin, storytelling, and faith into themes of freedom, hope, and
            responsibility&mdash;fuses Afrobeat rhythms with Lightning-fast
            zaps, transforming sound waves into sovereign anthems. Kweks, a
            featured force in Bitcoin For The Arts, Inc. (BFTA), personifies the
            organization&rsquo;s sovereign renaissance: artists who stack sats
            not just in wallets, but in stories that uplift communities from
            Arusha to Tokyo. As a well-known figure in the Bitcoin space, he has
            elevated value-for-value to new heights, harnessing Bitcoin&rsquo;s
            tools to thrive on a sound-money standard&mdash;releasing music on
            platforms where listeners zap sats directly, funding not only his
            craft but real-world impact through education and empowerment
            initiatives.
          </p>

          <p>
            Kweks&rsquo;s journey is a testament to Bitcoin&rsquo;s borderless
            promise. Hailing from Tanzania, where he champions adoption through
            Bitcoin Arusha meetups, Proof Of Work Academy (POWA), and Hedhi Huru,
            he discovered BTC while seeking solutions to Africa&rsquo;s economic
            woes: currency instability, limited financial access, and barriers to
            long-term wealth. He views it as more than technology&mdash;a tool
            for dignity, stewardship, and empowerment that aligns with his
            Christian values of responsibility and service. Climbing Kilimanjaro
            with Bitcoin and Nostr comrades wasn&rsquo;t mere adventure; it
            symbolized ascent from centralized shackles to decentralized heights.
            Philosophically, Bitcoin reframed his worldview: from
            audience-supported zaps funding his craft to rejecting fiat&rsquo;s
            &ldquo;rigged games.&rdquo; Challenges? The volatility of early
            adoption honed his low-time-preference grit, turning setbacks into
            beats that resonate with resilience.
          </p>

          {/* Album cover */}
          <div className="my-12 mx-auto max-w-sm">
            <div className="overflow-hidden rounded-xl border-4 border-[#d4af37] shadow-[4px_6px_20px_rgba(0,0,0,0.25)]">
              <Image
                src="/Man-Like-Album-Cover.jpg"
                alt="Tokyo Citadel Remix — Man Like Kweks & reelrichard"
                width={640}
                height={480}
                className="w-full"
              />
            </div>
            <p className="mt-3 text-center text-sm italic text-muted font-[var(--font-display)]">
              Tokyo Citadel Remix (with reelrichard) &mdash; stream via
              value-for-value on Fountain or Wavlake
            </p>
          </div>

          <p>
            At the core of Kweks&rsquo;s sovereignty lies his music, a fusion of
            Tanzanian vibes and global Bitcoin narratives. Tracks like
            &ldquo;Tokyo Citadel Remix&rdquo; (with reelrichard) paint vivid
            soundscapes of citadels rising against economic empires, blending
            hip-hop flows with Bitcoin lore in a cyberpunk haze&mdash;listen and
            support via value-for-value on Fountain or Wavlake. &ldquo;Rising
            Free,&rdquo; a collaborative anthem, soars with lyrics of
            liberation, mirroring his EP &ldquo;EPOCH 5&rdquo; on
            Wavlake&mdash;where sats flow directly from fans, bypassing
            labels&rsquo; predatory cuts. Exhibiting at Bitcoin conferences,
            Kweks doesn&rsquo;t just perform; he builds ecosystems, from
            teaching barbers Lightning wallets to zapping street artists. His
            Nostr presence amplifies this: a censorship-resistant hub for his
            streams of consciousness, where music meets meme in value-for-value
            glory. Stream his full catalog on Spotify for a deeper dive into his
            faith-infused, sovereignty-driven sound.
          </p>

          <p>
            Take &ldquo;Tokyo Citadel Remix,&rdquo; a favorite that matters
            deeply: its pulsating basslines and lyrical nods to satoshis evoke a
            global citadel where Tanzanian roots meet Japanese precision,
            symbolizing Bitcoin&rsquo;s universal bridge across the timechain. Or
            &ldquo;Rising Free,&rdquo; where soaring hooks celebrate HODLing as
            spiritual ascent, resisting traditional music industry&rsquo;s fiat
            fragility. These aren&rsquo;t mere songs; they&rsquo;re sovereign
            symphonies, critiquing centralized finance while innovating with
            Lightning-integrated releases on Bitcoin&rsquo;s immutable
            timechain. In Kweks&rsquo;s world, art isn&rsquo;t
            commodified&mdash;it&rsquo;s communal, abundant, and unyielding.
          </p>

          <p>
            Bitcoin has supercharged Kweks&rsquo;s independence: as a Tanzanian
            trailblazer, it enables borderless collaborations, from remixes with
            Joe Martin to sats-funded climbs. No more begging labels; his Blink
            wallet and Wavlake streams ensure self-reliance, turning fans into
            patrons. He has taken value-for-value to a new level, releasing music
            on platforms where Lightning zaps create direct, permissionless
            support&mdash;sats that not only sustain his artistry but fund
            community programs like POWA&rsquo;s education initiatives and Hedhi
            Huru&rsquo;s social impact, bridging creativity, faith, and tangible
            change. Financially, it grants true sovereignty; philosophically,
            it&rsquo;s his &ldquo;DCA2BTC&rdquo; mantra&mdash;dollar-cost-averaging
            into a life of purpose.
          </p>

          <blockquote>
            <p>
              &ldquo;Man Like Who? Be bold, build your citadel, and let the sats
              flow.&rdquo;
            </p>
          </blockquote>

          <p>
            To fellow creators exploring Bitcoin, Kweks advises: &ldquo;Man Like
            Who? Be bold, build your citadel, and let the sats flow.&rdquo; In
            Kweks, BFTA unearths a global paragon: a musician whose Tanzanian
            thunder and Bitcoin beats herald a renaissance where art
            doesn&rsquo;t just survive&mdash;it soars, one zap at a time.
          </p>
        </div>

        {/* Back to stories */}
        <div className="mt-14 border-t border-border pt-8">
          <Link
            href="/stories"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:opacity-80"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Back to Artist Stories
          </Link>
        </div>
      </article>
    </main>
  );
}
