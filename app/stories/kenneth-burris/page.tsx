import FramedImage from "@/components/FramedImage";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Kenneth Burris – Sovereign Strokes in the Shadow of Cooling Towers | Bitcoin for the Arts",
  description:
    "Kenneth Burris, a New York-based oil painter with over three decades of studio mastery, embodies the sovereign renaissance that Bitcoin for the Arts champions.",
};

export default function KennethBurrisPage() {
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
            Kenneth Burris &ndash; Sovereign Strokes in the Shadow of Cooling
            Towers
          </h1>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-white/60">
            By Eliza Thornberry, Art Critic for The New York Times
          </p>
        </div>
      </section>

      {/* Article body */}
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <div className="prose-article">
          <p>
            In an era where digital ephemera floods our screens and AI churns
            out infinite images, Kenneth Burris stands as a defiant sentinel of
            permanence. This New York-based oil painter, with over three decades
            of studio mastery, doesn&rsquo;t merely create art; he forges it as
            a bulwark against the fleeting. His Post-Globalist Landscape series,
            where industrial behemoths like cooling towers loom amid misty
            wildernesses, provokes a visceral question: What endures when empires
            of code crumble? Burris, a featured artist with Bitcoin For The
            Arts, Inc. (BFTA), embodies the sovereign renaissance the
            organization champions&mdash;artists reclaiming authorship,
            independence, and value in a world rigged by gatekeepers. Through his
            Direction Provenance Model (DPM), he transforms creative evolution
            into tangible, unalterable oil on canvas, echoing Bitcoin&rsquo;s
            immutable ledger in pigment and brushstroke.
          </p>

          <p>
            Burris&rsquo;s journey is no mere dabble in crypto curiosity;
            it&rsquo;s a profound alignment of philosophy and practice. First
            glimpsing Bitcoin in 2017 as a distant financial outlier, he plunged
            into its cultural depths by 2021, exhibiting at Bitcoin conferences
            from Miami to Las Vegas and even gracing the cover of Citadel21
            Magazine in its seminal piece, &ldquo;There Is a Renaissance
            Happening.&rdquo; &ldquo;Bitcoin isn&rsquo;t about
            speculation,&rdquo; Burris asserts in a recent interview at Bitcoin
            Las Vegas, &ldquo;it&rsquo;s about permanence, authorship, and
            independence.&rdquo; This ethos propelled him to develop DPM, a
            framework that meticulously documents a work&rsquo;s
            genesis&mdash;sketches, 3D models, digital
            explorations&mdash;before &ldquo;settling&rdquo; it into a physical
            painting, much like a blockchain transaction finalizes value. In a
            provocative twist, Burris accepts Bitcoin for commissions, working
            directly with collectors as well as independently through his studio
            practice, forging direct bonds with collectors. His feature with
            BFTA, evident in his submission to their artist hub, positions him as
            a trailblazer in their mission to stack culture on sound money.
          </p>

          {/* Featured painting — Alone */}
          <div className="my-12 mx-auto max-w-xl">
            <FramedImage
              src="/Alone_Oil on canvas_24x36inches.jpg"
              alt="Alone by Kenneth Burris — a cooling tower embedded within a quiet river landscape"
              caption="Alone, Oil on canvas, 24 &times; 36 inches"
            />
          </div>

          <p>
            At the heart of Burris&rsquo;s sovereignty lies his Post-Globalist
            Landscape series, a body of work that confronts the detritus of
            industrial ambition with haunting beauty. These oils depict cooling
            towers, conduits, and power lines not as ruins, but as quiet titans
            embedded in nature&mdash;symbols of resilience in a post-global
            economy fractured by AI abundance and fiat fragility. &ldquo;As
            image creation accelerated through software and AI,&rdquo; Burris
            reflects, &ldquo;Bitcoin clarified what could endure.&rdquo; His
            exhibitions at venues like the Queens Museum and Bitcoin Art Gallery
            underscore his world-class stature, blending traditional accolades
            with decentralized daring.
          </p>

          <p>
            Take &ldquo;Alone,&rdquo; a 24 &times; 36 inch oil painting that
            depicts a cooling tower embedded within a quiet river landscape,
            partially obscured by atmosphere and distance. The structure exists
            as an integrated presence within the environment, alongside water,
            vegetation, and geological time. Rather than illustrating collapse,
            the painting reflects continuity: infrastructure persisting as part
            of the landscape&rsquo;s ongoing transformation. Burris describes
            the work as a permanent record of decisions, resolved materially
            through oil on canvas.
          </p>

          {/* Two paintings side by side */}
          <div className="my-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FramedImage
              src="/Moist Still Water_Oil on canvas_24x36inches.jpg"
              alt="Moist Still Water (Landscape with Poles) by Kenneth Burris"
              caption="Moist Still Water (Landscape with Poles), Oil on canvas, 24 &times; 36 in, 2026"
            />
            <FramedImage
              src="/Coastal Sea Shore_OIl on canvas_11x14inches.jpg"
              alt="Coastal Sea Shore (Moss-covered) by Kenneth Burris"
              caption="Coastal Sea Shore (Moss-covered), Oil on canvas, 11 &times; 14 in, 2025"
            />
          </div>

          <p>
            This theme of enduring harmony extends to other works in the series,
            such as &ldquo;Moist Still Water (Landscape with Poles),&rdquo; a 24
            &times; 36 inch oil on canvas from 2026, where utility poles stand
            sentinel amid serene, watery expanses, blending human ingenuity with
            natural flux. Similarly, &ldquo;Coastal Sea Shore
            (Moss-covered),&rdquo; an 11 &times; 14 inch piece from 2025,
            captures moss-draped shores where the organic reclaims the built,
            evoking a subtle dialogue between time&rsquo;s layers. In these
            canvases, one senses the artist&rsquo;s sovereign command: no
            algorithm could replicate the textured impasto or the subtle play of
            light on water, evoking Caspar David Friedrich&rsquo;s romantic
            sublime reimagined for the blockchain age.
          </p>

          <p>
            But Burris&rsquo;s provocation extends beyond the canvas. In his
            Post-Globalist Essays, he dissects blockchain&rsquo;s role in
            bridging digital and tangible worlds, critiquing NFTs as mere
            preludes to true authorship. Works like those in his
            series&mdash;machinery integrated with verdant life&mdash;mirror
            Bitcoin&rsquo;s promise: a system that weathers volatility to build
            lasting value. &ldquo;We built the ledger, but lost the
            legend,&rdquo; he writes, urging artists to reclaim narrative
            sovereignty. Financially, Bitcoin has liberated him from
            institutional whims, enabling international collaborations and a
            studio practice rooted in self-reliance.
          </p>

          <blockquote>
            <p>
              &ldquo;Focus on developing a clear and durable practice rather
              than short-term trends. Bitcoin provides tools for independence,
              but the foundation remains the work itself.&rdquo;
            </p>
          </blockquote>

          <p>
            For emerging artists eyeing Bitcoin&rsquo;s horizon, Burris offers
            sage counsel: &ldquo;Focus on developing a clear and durable
            practice rather than short-term trends. Bitcoin provides tools for
            independence, but the foundation remains the work itself.&rdquo; As
            a featured artist with BFTA, he exemplifies their vision&mdash;a
            world where creators HODL not just sats, but their very legacies.
          </p>

          <p>
            In Burris, we witness a Renaissance man: painter, philosopher, and
            pioneer. His art doesn&rsquo;t just hang on walls; it challenges us
            to envision a sovereign future, one brushstroke at a time.
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
