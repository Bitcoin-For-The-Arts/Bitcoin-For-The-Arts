import FramedImage from "@/components/FramedImage";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Hitomi Matsui – The Quiet Observer in a Digital Storm | Bitcoin for the Arts",
  description:
    "Hitomi Matsui, an Osaka-born New York artist, channels Bitcoin culture and digital-age anxieties into contemplative illustrated vignettes starring Nekosan the white cat.",
};

export default function HitomiMatsuiPage() {
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
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Hitomi Matsui &ndash; The Quiet Observer in a Digital Storm
          </h1>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/60">
            Bitcoin For The Arts, Inc.
          </p>
        </div>
      </section>

      {/* Article body */}
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <div className="prose-article">
          <p>
            In the ceaseless churn of New York&rsquo;s art scene, where
            provocation often trumps subtlety, Hitomi Matsui emerges as a rare
            voice of contemplative restraint. Born in Osaka, Japan, and growing
            up amid the economic bubble, Matsui witnessed the dizzying highs of
            prosperity and the sobering lows of stagnation that followed. This
            duality, etched into her worldview, propelled her into a life of
            nomadic exploration: backpacking across Asia in the 1990s, absorbing
            the raw mechanics of survival and value in disparate societies. Since
            settling in New York in 2000, she has channeled these experiences
            into a practice that deftly interrogates the invisible architectures
            of our digital age&mdash;systems of money, algorithms, and
            sovereignty&mdash;through the unassuming lens of a white cat named
            Nekosan.
          </p>

          <p>
            Matsui&rsquo;s encounter with Bitcoin in 2020 was less a thunderclap
            than a gradual illumination. &ldquo;I was trying to understand how
            money and financial systems really work,&rdquo; she recounts in a
            recent written exchange. What began as casual curiosity evolved into
            a profound revelation: Bitcoin as a decentralized, peer-to-peer
            network echoed the self-reliant ethos of her family&rsquo;s
            traditional small business in Japan. Eschewing centralized authority
            felt instinctive, a natural extension of the economic realities she
            had navigated. By 2022, this fascination had infiltrated her art,
            leading to exhibitions at major Bitcoin conferences in Miami and Las
            Vegas, as well as international venues. Her installations, often
            rooted in Bitcoin culture&rsquo;s memes and narratives, marked her
            as an insider rather than an interloper&mdash;a creator whose
            practice bloomed within the ecosystem.
          </p>

          {/* Featured artwork */}
          <div className="my-12 mx-auto max-w-xl">
            <FramedImage
              src="/matsui-just-right-price.jpg"
              alt="Who Decided the Just Right Price — Nekosan on a NYC fire escape by Hitomi Matsui"
              caption="&ldquo;Who Decides the &lsquo;Just Right Price&rsquo;?&rdquo;"
            />
          </div>

          <p>
            Initially grounded in analog processes like felt sculpture,
            Matsui&rsquo;s work took a pivotal turn with Bitcoin&rsquo;s
            influence. One standout piece, a hand-sewn felt recreation of a
            McDonald&rsquo;s inspired by a viral Bitcoin meme, captured the
            absurdity and profundity of internet culture. Featured in The Wall
            Street Journal, it exemplified her knack for translating ephemeral
            digital phenomena into tactile, enduring forms. Yet, as AI,
            algorithmic dominance, and inflationary forces accelerated, Matsui
            sensed Bitcoin&rsquo;s symbolism alone couldn&rsquo;t encompass the
            era&rsquo;s complexities. &ldquo;Bitcoin symbolically alone was not
            enough to express the full complexity of our digital
            society,&rdquo; she explains. This epiphany birthed Nekosan, a
            holographic white cat shuttling between New York and Osaka, observing
            the mundane with quiet wisdom.
          </p>

          {/* Two artworks side by side */}
          <div className="my-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FramedImage
              src="/matsui-just-right-ad.jpg"
              alt="Why is this Just Right Ad Showing Up — NYC triptych by Hitomi Matsui"
              caption="&ldquo;Why is this Just Right Ad Showing Up?&rdquo;"
            />
            <FramedImage
              src="/matsui-nekosan-detective.jpg"
              alt="Nekosan detective investigating targeted ads by Hitomi Matsui"
              caption="&ldquo;Why Is the &lsquo;Just Right Ad&rsquo; Showing Up?&rdquo;"
            />
          </div>

          <p>
            Nekosan, inspired by Matsui&rsquo;s own cat Pablo, is no mere
            whimsy. Through illustrated vignettes&mdash;sipping coffee,
            pondering targeted ads, or musing on value storage from cash to
            Bitcoin&mdash;the character distills thorny concepts into relatable
            human (or feline) stories. Her portfolio at hitomimatsui.com further
            reveals Nekosan&rsquo;s roots in Japanese concepts like ichigo ichie
            (treasuring fleeting encounters), often through meals and cultural
            rituals that underscore transience in a hyper-connected world.
          </p>

          {/* Article-exclusive fourth artwork */}
          <div className="my-12 mx-auto max-w-xl">
            <FramedImage
              src="/matsui-nekosan-value-storage.jpg"
              alt="Nekosan pondering value storage — piggy bank, real estate, gold, and Bitcoin by Hitomi Matsui"
              caption="&ldquo;Protecting Assets from Inflation, Meow!&rdquo;"
            />
          </div>

          <p>
            What elevates Matsui&rsquo;s oeuvre is its subtle assertion of
            sovereignty. In an art market riddled with gatekeepers, she leverages
            Bitcoin&rsquo;s ethos to forge direct connections with collectors and
            collaborators, bypassing traditional institutions. &ldquo;Bitcoin
            introduced me to a global community that operates outside many
            traditional art structures,&rdquo; she notes. This shift fosters
            innovation: from felt memes to narrative essays on digital systems,
            her practice embodies self-reliance. Challenges abounded&mdash;grappling
            with Bitcoin&rsquo;s jargon and culture felt overwhelming at
            first&mdash;but breakthroughs came in viewing it as a cultural
            phenomenon, ripe for artistic reinterpretation.
          </p>

          <p>
            Philosophically, Bitcoin has reframed Matsui&rsquo;s lens on
            independence. &ldquo;It helped me understand money not just as
            something we use every day, but as a system that influences politics,
            economics, and individual freedom,&rdquo; she says. Nekosan, then,
            becomes a bridge: for Bitcoin novices, a gentle entry into its ideas;
            for veterans, a mirror to the emotional tensions of digital life.
          </p>

          <blockquote>
            <p>
              &ldquo;Approach Bitcoin with curiosity rather than
              expectation&hellip; It offers a community that is open to
              experimentation and new forms of cultural expression.&rdquo;
            </p>
          </blockquote>

          <p>
            As Matsui advises fellow artists: &ldquo;Approach Bitcoin with
            curiosity rather than expectation&hellip; It offers a community that
            is open to experimentation and new forms of cultural
            expression.&rdquo;
          </p>

          <p>
            In Nekosan&rsquo;s quiet gaze, Matsui captures the discomforts and
            hopes of our era&mdash;not with bombast, but with the soft
            persistence of a cat padding through rain-slicked streets. Hers is
            art as observation, a vital counterpoint in a world of noise,
            reminding us that true sovereignty begins with seeing the unseen. As
            Bitcoin heralds a civilizational shift, Matsui&rsquo;s evolving body
            of work interprets it not as trend, but as timeless inquiry.
          </p>
        </div>

        {/* Artist link */}
        <div className="mt-14 rounded-2xl border border-[#d4af37]/40 bg-surface/50 p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
            Explore the Artist
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Discover more of Hitomi Matsui&rsquo;s illustrated vignettes,
            Nekosan stories, and exhibition work.
          </p>
          <div className="mt-4">
            <a
              href="https://hitomimatsui.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              hitomimatsui.com
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H21m0 0v7.5m0-7.5l-11.25 11.25" />
              </svg>
            </a>
          </div>
        </div>

        {/* Back to stories */}
        <div className="mt-8 border-t border-border pt-8">
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
