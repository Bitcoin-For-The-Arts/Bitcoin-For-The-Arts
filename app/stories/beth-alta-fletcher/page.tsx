import FramedImage from "@/components/FramedImage";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Beth Alta Fletcher – Frontier Visions in the Ledger of Freedom | Bitcoin for the Arts",
  description:
    "Beth Alta Fletcher, an Alaskan digital artist and Bitcoin visionary, conjures hand-generated digital symphonies that defy convention and demand sovereignty.",
};

export default function BethAltaFletcherPage() {
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
            Beth Alta Fletcher &ndash; Frontier Visions in the Ledger of Freedom
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
            In the vast, untamed expanse of digital creation, where algorithms
            churn soulless facsimiles and AI threatens to commodify the human
            spark, Beth Alta Fletcher emerges as a defiant oracle from
            Alaska&rsquo;s wilds. This multifaceted artist&mdash;athlete turned
            Rolfer, yogi turned Bitcoin visionary&mdash;wields her MacBook Pro
            like a shaman&rsquo;s tool, conjuring hand-generated digital
            symphonies that defy convention and demand sovereignty. Fletcher, a
            featured voice in Bitcoin For The Arts, Inc. (BFTA), embodies the
            organization&rsquo;s clarion call for a cultural renaissance:
            creators unshackled from fiat&rsquo;s erosion, gatekeepers&rsquo;
            grasp, and self-imposed silence. Her stream-of-consciousness works,
            born in meditative trance and refined through painstaking
            pixel-by-pixel labor, pulse with the raw freedom of her Alaskan
            roots&mdash;vast horizons where human ingenuity meets unyielding
            nature, now transposed to Bitcoin&rsquo;s immutable ledger.
          </p>

          <p>
            Fletcher&rsquo;s odyssey is as epic as the landscapes that forged
            her. Raised amid Alaska&rsquo;s glacial majesty, she honed her body
            as a world-class snowboarder and skier, gracing the X-Games and
            World Cup circuits with a fearless grace that echoed the untethered
            spirit of her homeland. Transitioning to the healing arts, she
            trained as a Rolfer&mdash;mastering Structural Integration, a
            philosophy of &ldquo;wholeness&rdquo; that aligns the body with
            gravity&rsquo;s inexorable pull&mdash;and immersed in yoga&rsquo;s
            embodied wisdom. Yet, it was Bitcoin that ignited her artistic fire.
            Intrigued by the Silk Road&rsquo;s subversive allure in 2010, she
            dove into BTC investments by 2017, captivated by its
            anti-establishment ethos during a bull market that felt like
            Alaska&rsquo;s midnight sun&mdash;endless, illuminating possibility.
            Challenges abounded: the siren call of shitcoins tempted her from
            HODLing, a hard-learned lesson in scarcity&rsquo;s virtue.
            Philosophically, Bitcoin reframed her worldview as a &ldquo;wholeness
            paradigm,&rdquo; revealing money&rsquo;s tentacles in every facet of
            existence, urging a perceptual shift toward unity and self-perception
            in an emerging era free from centralized tyranny.
          </p>

          {/* Featured artwork — Along The Watchtower */}
          <div className="my-12 mx-auto max-w-xl">
            <FramedImage
              src="/fletcher-along-the-watchtower.jpg"
              alt="Along The Watchtower by Beth Alta Fletcher — a vibrant digital composition of symbolic figures on a checkered floor with Bitcoin motifs"
              caption="&ldquo;Along The Watchtower&rdquo;"
            />
          </div>

          <p>
            This philosophical awakening catalyzed her Bitcoin art: a rebellion
            against digital ephemerality, a reclamation of authorship in an age
            of deepfakes and disinformation. Drawing from her Rolfing roots,
            Fletcher&rsquo;s creations explore interconnectedness&mdash;Bitcoin
            as a digital wholeness, mirroring the body&rsquo;s structural
            harmony. Her medium&mdash;meticulous digital compositions on a
            compact screen&mdash;demands patience, editing hundreds of elements
            into three-dimensional illusions that leap toward light, surprising
            even their creator. Themes of freedom abound: vast Alaskan vistas
            morph into symbolic rebellions, peer-to-peer networks evoke direct
            democracy, and Bitcoin motifs champion unbridled expression.
          </p>

          {/* Two artworks side by side */}
          <div className="my-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FramedImage
              src="/fletcher-le-patriot.jpg"
              alt="Le Patriot by Beth Alta Fletcher — a patriotic figure on horseback amid a surreal landscape"
              caption="&ldquo;Le Patriot&rdquo;"
            />
            <FramedImage
              src="/fletcher-lady-nakamoto.jpg"
              alt="Lady Nakamoto by Beth Alta Fletcher — a striking figure in a hexagonal frame"
              caption="&ldquo;Lady Nakamoto&rdquo;"
            />
          </div>

          <p>
            At the heart of Fletcher&rsquo;s sovereignty is her insistence on
            originality over technique. &ldquo;Art is ideas,&rdquo; she
            proclaims, dismissing skill&rsquo;s primacy in a digital deluge
            where concepts reign supreme. Her works, featured at the Bitcoin 2025
            Conference in Las Vegas amid luminaries like Coldie and
            Cryptograffiti, pulse with this ethos. Take her conceptual pieces
            from radicalindividual.com: intricate mandalas of blockchain fractals
            intertwined with Alaskan auroras, symbolizing the fusion of natural
            wholeness and decentralized resilience. Or her &ldquo;Prayer and
            Pilgrimage&rdquo; series, where symbolic streams of consciousness
            navigate toward enlightenment, each pixel a testament to
            self-reliance amid societal flux. These are not mere visuals; they
            are philosophical manifestos, resisting traditional galleries&rsquo;
            politesse and embracing Bitcoin&rsquo;s permissionless canvas.
          </p>

          <p>
            Bitcoin has revolutionized Fletcher&rsquo;s creation, shifting her
            from scarcity&rsquo;s grip to abundance&rsquo;s embrace. As a
            digital native, her art parallels BTC&rsquo;s intangible yet
            enduring form&mdash;no self-censorship, no fear of consequence.
            Financially, it grants independence: labeling herself a &ldquo;Bitcoin
            artist&rdquo; liberates her from political correctness, enabling
            bold, honest expression without institutional intermediaries.
            Philosophically, it aligns with her Rolfing roots&mdash;Bitcoin as a
            structural integrator for society, correcting misalignments in
            perception and power.
          </p>

          <blockquote>
            <p>
              &ldquo;Create your own style, search for your own unique voice and
              share it loudly. Be real, be bold and you can&rsquo;t
              lose.&rdquo;
            </p>
          </blockquote>

          <p>
            To aspiring artists dipping into Bitcoin&rsquo;s waters, Fletcher
            offers bold counsel: &ldquo;Create your own style, search for your
            own unique voice and share it loudly. Be real, be bold and you
            can&rsquo;t lose.&rdquo; In Fletcher, BFTA finds a paragon: a
            sovereign creator whose Alaskan grit and digital prowess illuminate
            the path to a wholeness paradigm, where art and money converge in
            unyielding freedom. Her visions don&rsquo;t just adorn screens; they
            provoke a revolution, one pixel, one sat at a time.
          </p>
        </div>

        {/* Artist link */}
        <div className="mt-14 rounded-2xl border border-[#d4af37]/40 bg-surface/50 p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
            Explore the Artist
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Discover more of Beth Alta Fletcher&rsquo;s digital compositions,
            conceptual series, and available works.
          </p>
          <div className="mt-4">
            <a
              href="https://radicalindividual.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              radicalindividual.com
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
