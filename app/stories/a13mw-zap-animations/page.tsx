import FramedImage from "@/components/FramedImage";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Zap Animations \u2013 Reviving the Spark in Bitcoin\u2019s Eternal Frame | Bitcoin for the Arts",
  description:
    "A13MW, a cyberpunk animator and Bitcoin artist, crafts hand-drawn ZAP animations that update consciousness one frame, one sat at a time.",
};

export default function A13mwZapAnimationsPage() {
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
            Zap Animations &ndash; Reviving the Spark in Bitcoin&rsquo;s Eternal
            Frame
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
            In the flickering glow of artistic resurrection, where fiat&rsquo;s
            fleeting shadows clash with Bitcoin&rsquo;s unyielding light, A13MW
            emerges as a cyberpunk alchemist, breathing life into forgotten
            frames of artistic sovereignty. This visionary animator and Bitcoin
            artist&mdash;a former UX Designer and eternal student of Living
            Systems&mdash;wields her tools like a digital wand, conjuring
            hand-drawn symphonies that dance across devices around the world.
            A13MW, a featured beacon in Bitcoin For The Arts, Inc. (BFTA),
            embodies the organization&rsquo;s sovereign renaissance: creators
            who reclaim independence from life&rsquo;s detours, stacking not
            just sats but stories that update consciousness in an era of
            algorithmic erosion. From childhood dreams of animation to tech
            survival as a single mom, her revival of some of her original
            character designs for animated Bitcoin narratives isn&rsquo;t mere
            nostalgia; it&rsquo;s a defiant zap against centralized control,
            proving art&rsquo;s superpower to illuminate humanity&rsquo;s
            paradigm shift toward wholeness and hard money.
          </p>

          <p>
            After graduating from Art School in Vancouver, she gained critical
            acclaim for her interface design in the 1998 Saatchi &amp; Saatchi
            Award for Innovation in Communications. She made the shortlist for
            her design&mdash;the IMI (Identity Mode Interface), a conceptual
            piece done in FLASH that allowed for both animation and
            interactivity. By playing with online identity in a way that
            foreshadowed Bitcoin&rsquo;s pseudonymity, it evoked visual and
            animated influences to explore how anonymity could be more visually
            innovative.
          </p>

          {/* Featured artwork — Crying Baby, Dancing Bee */}
          <div className="my-12 mx-auto max-w-md">
            <FramedImage
              src="/a13mw-crying-baby-dancing-bee.jpg"
              alt="Crying Baby, Dancing Bee — animated short poster by A13MW, screening at Bitcoin Film Festival June 2026"
              caption="&ldquo;Crying Baby, Dancing Bee&rdquo; &mdash; screening at Bitcoin Film Festival, June 2026"
            />
          </div>

          <p>
            A13MW&rsquo;s odyssey is a mosaic of perseverance and epiphany. From
            childhood sketches of the Tree of Life to aspiring independent
            animator as a teen, she pursued art to become a classical animator.
            She studied under the Oscar Award-Winning Animator Lee Mishkin at the
            Vancouver Institute of Media Arts, after studies at SAIT in Calgary
            and Emily Carr College of Art &amp; Design in Vancouver, where she
            mastered drawing and painting.
          </p>

          <p>
            By 2014, working as a UX designer, she first glimpsed BTC amid tech
            trends, dismissing it over energy rumors and ledger lore. But
            influences ran deep: since 1997, her passion for privacy and
            encryption&mdash;sparked by Japanese anime like &ldquo;Akira&rdquo;
            and cyberpunk fiction such as William Gibson&rsquo;s &ldquo;Mona
            Lisa Overdrive&rdquo;&mdash;led her to attend events such as the one
            hosted by Toronto&rsquo;s Zero Knowledge Systems, where PoW vs. PoS
            debates planted seeds she wouldn&rsquo;t fully grasp until 2024.
          </p>

          <p>
            In the summer of 2024, a decade later, while attending DWeb Camp in
            California&rsquo;s Redwoods&mdash;hosted by Internet
            Archive&mdash;she learned about NOSTR, a privacy-first social media
            ecosystem based on relays. This breakthrough reignited her fire for
            Bitcoin. &ldquo;Bitcoin was alive and well,&rdquo; she recalls,
            discovering its art community on NOSTR. She pivoted from UX design
            to making BTC art, shocking family who labeled her &ldquo;crazy white
            woman&rdquo; and &ldquo;right-wing nut job.&rdquo;
            Unfazed&mdash;as artists are outsiders&mdash;she embraced the single
            use case of BTC as a monetary revolution for all.
          </p>

          {/* Two artworks side by side */}
          <div className="my-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FramedImage
              src="/a13mw-gone-with-the-wind.jpg"
              alt="Gone with the Wind — digital animation art by A13MW"
              caption="&ldquo;Gone with the Wind&rdquo;"
            />
            <FramedImage
              src="/a13mw-towards-the-light.jpg"
              alt="Towards the Light — digital animation art by A13MW"
              caption="&ldquo;Towards the Light&rdquo;"
              objectPosition="bottom"
            />
          </div>

          <p>
            Challenges forged her resolve. From exploring how to create
            currencies for an online social commons to figuring out how to fit
            into BTC art culture as an independent animator, there were many. Her
            BTC art peers dismissed animation as being purely digital or simply
            &ldquo;cartoons,&rdquo; without understanding that animation gave
            birth to filmmaking. Storytelling through moving images, rather than
            a single static image like a painting, can have even more
            educational impact in the bid to establish narratives for the BTC
            memeplex that can lead to mass adoption over time.
          </p>

          <p>
            Attending the Africa Bitcoin Conference in Boston in the summer of
            2025 revealed that the concept of BTC for survival in Africa and
            within circular economies worldwide is more aligned with her values
            than the Western model of BTC for Fintech speculation and global
            control of commodities like gold. Philosophically, Bitcoin unveiled
            money&rsquo;s matrix. Bitcoin&rsquo;s liberation in sovereignty
            enabled A13MW to envision circular economies rooted in indigenous
            wisdom free from colonial theft. She is inspired to create animations
            around these narratives.
          </p>

          <p>
            As a hobby, she ferments the ancient Japanese KOJI fungus, the
            foundation of the third most popular ingredient on the planet known
            as Miso. A13MW sees BTC as a way to achieve artistic sovereignty:
            hard money that allows her to become an independent animator and not
            just a studio hack, a way to heal herself from the poison of fiat
            culture and extend her lifespan to create labor-intensive,
            proof-of-work, independent ZAP animations.
          </p>

          <p>
            &ldquo;The role of art is to update consciousness,&rdquo; she says,
            taking her cue from the Canadian media theorist Marshall McLuhan. Her
            studies of media manifest in her animated works, which she calls ZAP
            Animations. She makes short animations&mdash;from a few seconds to
            10 minutes&mdash;that do not follow the usual Western studio tropes,
            in an attempt to bring the new realities of BTC into focus and to
            encourage others to support her work through zaps. Her medium: 2D
            hand-drawn digital animation, is scarce in its proof-of-work
            demands.
          </p>

          <p>
            A13MW&rsquo;s upcoming 10-minute &ldquo;Crying Baby, Dancing
            Bee&rdquo; animated short will screen in June 2026 at the Bitcoin
            Film Festival. It explores the relationship between a crying baby
            and a dancing bee through the lens of Bitcoin. From her prior 2023
            &ldquo;PeaceMaker AI&rdquo; poster as an Information Architect
            within the UX ecosystem, to the creation of the &ldquo;2 Row Flow
            Cultural Commons&rdquo; in 2018&mdash;a virtual space for indigenous
            and non-indigenous in North America to explore &ldquo;right
            relationship&rdquo;&mdash;her projects cross-pollinate ideas and
            concepts related to living systems and relationships.
          </p>

          <blockquote>
            <p>
              &ldquo;Determine if you&rsquo;re in for money or revolution;
              reflect on BTC&rsquo;s framework; create original work and fund it
              with BTC.&rdquo;
            </p>
          </blockquote>

          <p>
            Bitcoin grants intellectual freedom, sidestepping fragile
            single-focused communities. While Bitcoin is all about money, its
            impact is broad. Money impacts everything in society&mdash;from
            day-to-day survival to global wars. It promises artistic sovereignty.
            Projects backed by Bitcoin will fund animations that aspire to heal
            and enlighten amid fiat&rsquo;s ongoing conflicts.
          </p>

          <p>
            To artists exploring Bitcoin, A13MW counsels: Determine if
            you&rsquo;re in for money or revolution; reflect on BTC&rsquo;s
            framework; create original work and fund it with BTC. In A13MW and
            her Deep Beauty Animation studio, Bitcoin For the Arts finds a
            paragon: an animator whose cyberpunk grit and fermenting wisdom
            ignite a renaissance, where art doesn&rsquo;t just move&mdash;it
            zaps consciousness awake, one frame, one sat at a time.
          </p>
        </div>

        {/* Artist link */}
        <div className="mt-14 rounded-2xl border border-[#d4af37]/40 bg-surface/50 p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
            Explore the Artist
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Discover more of A13MW&rsquo;s ZAP Animations, Deep Beauty Animation
            studio, and upcoming Bitcoin Film Festival screening.
          </p>
          <div className="mt-4">
            <a
              href="https://www.a13mw.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              a13mw.com
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
