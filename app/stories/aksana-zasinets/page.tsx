import FramedImage from "@/components/FramedImage";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Aksana Zasinets (5Ksana) – Stitching Sovereignty Through the Needle\u2019s Eye | Bitcoin for the Arts",
  description:
    "Aksana Zasinets, a Polish-born Bitcoin artist and fashion designer with 22 years of tailoring mastery, crafts hand-embroidered masterpieces weaving sovereignty and Bitcoin into every stitch.",
};

export default function AksanaZasinetsPage() {
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
            Stitching Sovereignty: Aksana Zasinets and the Thread of Bitcoin in
            Contemporary Art
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
            In an era where digital currencies challenge the very fabric of
            economic and cultural systems, artists like Aksana
            Zasinets&mdash;known by her stage name 5Ksana&mdash;are redefining
            sovereignty through the needle&rsquo;s eye. A Polish-born Bitcoin
            artist and fashion designer with over 22 years as a professional
            tailor, Zasinets crafts hand-embroidered masterpieces that blend
            traditional craftsmanship with the revolutionary ethos of
            cryptocurrency. Her work, exhibited through her self-hosted platform
            BuyBitArt.com, isn&rsquo;t merely decorative; it&rsquo;s a manifesto
            of independence, weaving themes of personal freedom,
            decentralization, and human resilience into every stitch. As she
            poignantly states in her philosophy: &ldquo;Today, in the world of
            technology, the most important thing is to stay HUMAN.&rdquo;
          </p>

          <p>
            Zasinets&rsquo;s journey into Bitcoin began modestly in 2016,
            introduced by her husband, Aliaksandr Zasinets&mdash;a cybersecurity
            expert recently acknowledged by Apple for identifying
            vulnerabilities in their web servers. &ldquo;He told me about a new
            idea and new digital money that works without banks or other
            intermediaries,&rdquo; she recalls. What captivated her was
            Bitcoin&rsquo;s promise of economic freedom&mdash;a peer-to-peer
            system unbound by governmental oversight. This resonated deeply with
            her background in hand sewing and embroidery, skills honed from
            childhood under her grandmother&rsquo;s guidance and formalized
            through tailoring studies in her teenage years. Initially met with
            skepticism from peers who dismissed her enthusiasm as
            &ldquo;crazy,&rdquo; Zasinets&rsquo;s perspective shifted
            dramatically upon selling her first painting for Bitcoin. &ldquo;I
            realized how easy and convenient it is to receive money for my
            art,&rdquo; she says. This &ldquo;aha&rdquo; moment underscored
            Bitcoin&rsquo;s practicality, transforming it from an abstract
            concept into a tool for real-world empowerment.
          </p>

          {/* Featured artwork — Bullcoin */}
          <div className="my-12 mx-auto max-w-xl">
            <FramedImage
              src="/zasinets-bullcoin.jpg"
              alt="Bullcoin by Aksana Zasinets — hand-embroidered beaded bull with Bitcoin coin eyes on black velvet"
              caption="&ldquo;Bullcoin&rdquo; &mdash; hand-embroidered beadwork on velvet"
            />
          </div>

          <p>
            Beyond the canvas, Bitcoin has profoundly reshaped Zasinets&rsquo;s
            life. It facilitated travel, forged global friendships within the
            Bitcoin community, and provided crucial support during personal
            hardships&mdash;including funding medical treatments and a successful
            crowdfunding campaign on the Geyser platform to acquire sewing
            machines. &ldquo;Bitcoin showed me the power of community and support
            between people,&rdquo; she reflects. &ldquo;It also gave me a
            feeling of more financial freedom and independence.&rdquo;
            Philosophically, Bitcoin evokes for her the untamable forces of
            nature&mdash;a phoenix rising from ashes, mirroring elements like
            wind and fire that defy control. This mindset infuses her art with a
            sense of abundance over scarcity, decentralization over hierarchy,
            positioning her as a key figure in what some call a &ldquo;cultural
            renaissance&rdquo; spurred by cryptocurrency.
          </p>

          <p>
            At the heart of Zasinets&rsquo;s practice is hand embroidery, a
            medium she chose after experimenting with various techniques because
            it feels &ldquo;natural.&rdquo; Inspired by artists like Margaret
            Keane, whose emotive, wide-eyed portraits echo in
            Zasinets&rsquo;s own stylistic explorations, she combines her
            tailoring expertise with Bitcoin motifs to express sovereignty. A
            prime example is her open-source project, BitcoinArt, co-created
            with her husband and shared freely on GitHub. This generous
            initiative offers other Bitcoin artists and independent creators a
            simple, customizable way to build their own personal
            website&mdash;complete with a gallery, online store, and auction
            tools&mdash;to showcase and sell their handmade, Bitcoin-inspired
            works directly to collectors. By running it on their own servers,
            artists gain complete control over their art and story, free from the
            whims of big platforms that could remove content or impose rules. As
            Zasinets explains, &ldquo;An independent website is very important
            because the artist fully controls their content and presentation. It
            is also a place that cannot be easily deleted or
            censored.&rdquo;
          </p>

          {/* Two artworks side by side */}
          <div className="my-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <FramedImage
              src="/zasinets-girl-bitcoin-eye.jpg"
              alt="The Girl with the Bitcoin Eye by Aksana Zasinets — embroidered diptych portraits"
              caption="&ldquo;The Girl with the Bitcoin Eye&rdquo;"
            />
            <FramedImage
              src="/zasinets-world-of-bitcoin.jpg"
              alt="World of Bitcoin by Aksana Zasinets — embroidered cosmic eye with Bitcoin symbol"
              caption="&ldquo;World of Bitcoin&rdquo;"
            />
          </div>

          <p>
            Her artworks themselves are poignant critiques of modern systems.
            Take &ldquo;Bitcoin Footprint,&rdquo; an embroidered piece depicting
            Bitcoin as &ldquo;the imprint of a soul&mdash;precise and unique,
            like a fingerprint of a free person.&rdquo; Through intricate
            threads, it symbolizes personal identity and liberty in a digitized
            world. Even more personal is &ldquo;Eyes of Bitcoin,&rdquo; created
            during a tumultuous period in her life. &ldquo;I experimented and
            looked for a new way to express my ideas,&rdquo; she shares.
            &ldquo;This painting is very special to me because it stayed with me
            during a hard time.&rdquo; The work&rsquo;s experimental style
            captures the gaze of transformation, where old values yield to
            futuristic visions. On International Women&rsquo;s Day 2026,
            Zasinets shared another evocative piece on X: &ldquo;The Girl with
            the Bitcoin Eye,&rdquo; an embroidery celebrating vision, strength,
            and creativity among Bitcoin women.
          </p>

          <p>
            Bitcoin&rsquo;s integration extends to monetization: Zasinets
            employs BTCPay Server on her site for fee-free, direct payments,
            bypassing traditional galleries. Crowdfunding via Geyser has further
            enabled innovation, allowing her to sidestep gatekeepers and
            collaborate globally. This financial autonomy has liberated her
            creative process, fostering themes of self-reliance that resonate in
            today&rsquo;s art world, where NFTs and digital assets often
            overshadow physical craft. Yet Zasinets&rsquo;s tactile
            works&mdash;rooted in craftivism&mdash;remind us of the human touch
            in an increasingly algorithmic landscape.
          </p>

          <blockquote>
            <p>
              &ldquo;First, ask yourself: What is Bitcoin for you? Is it freedom,
              independence, or money? When you know what Bitcoin means to you, it
              becomes easier to find ideas and inspiration for your art. Use your
              own skills, style, and experience&mdash;create something honest and
              meaningful.&rdquo;
            </p>
          </blockquote>

          <p>
            For aspiring artists dipping into Bitcoin, Zasinets offers sage
            advice: &ldquo;First, ask yourself: What is Bitcoin for you? Is it
            freedom, independence, or money? When you know what Bitcoin means to
            you, it becomes easier to find ideas and inspiration for your art.
            Use your own skills, style, and experience&mdash;create something
            honest and meaningful.&rdquo; In a time when art grapples with AI,
            inflation, and institutional control, Zasinets&rsquo;s embroidered
            narratives stand as a testament to enduring humanity. Her story,
            shared through Bitcoin For The Arts, Inc., invites us to reconsider
            not just money, but the very threads that bind our creative souls.
          </p>
        </div>

        {/* Artist link */}
        <div className="mt-14 rounded-2xl border border-[#d4af37]/40 bg-surface/50 p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
            Explore the Artist
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Discover more of Aksana Zasinets&rsquo;s hand-embroidered Bitcoin
            art, open-source tools, and available works.
          </p>
          <div className="mt-4">
            <a
              href="https://buybitart.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              buybitart.com
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
