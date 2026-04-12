import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Benjamin Ella – A Royal Ballet Soloist's Sovereign Leap to Bitcoin | Bitcoin for the Arts",
  description:
    "Benjamin Ella, a 17-season Soloist of The Royal Ballet, shares how Bitcoin changed his thinking about money, art, and faith — and why the old funding model for the arts is breaking.",
};

const links = {
  royalBallet: "https://www.rbo.org.uk/people/benjamin-ella",
  episode: "https://youtu.be/8FadoHhvxwY",
  northernBallet: "https://northernballet.com/biography/benjamin-ella",
};

const extLink =
  "underline decoration-accent/40 underline-offset-2 transition-colors hover:text-accent hover:decoration-accent";

export default function BenjaminEllaPage() {
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
                src="/Benjamin-Ella-BFTA-Artist.jpg"
                alt="Benjamin Ella"
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Benjamin Ella
              </h1>
              <p className="mt-2 text-lg text-white/70 font-[var(--font-display)] italic">
                A Royal Ballet Soloist&rsquo;s Sovereign Leap to Bitcoin
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-white/50">
                Bitcoin For The Arts, Inc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Episode embed */}
      <div className="mx-auto max-w-4xl px-6 pt-10">
        <div className="overflow-hidden rounded-2xl border-4 border-[#d4af37] shadow-[4px_6px_20px_rgba(0,0,0,0.25)]">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src="https://www.youtube.com/embed/8FadoHhvxwY"
              title="Share Your Bitcoin Journey: Episode 4 — Benjamin Ella"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
        <p className="mt-3 text-center text-sm italic text-muted font-[var(--font-display)]">
          Share Your Bitcoin Journey: Episode 4 &mdash; watch on{" "}
          <a href={links.episode} target="_blank" rel="noopener noreferrer" className={extLink}>
            YouTube
          </a>
        </p>
      </div>

      {/* Article body */}
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <div className="prose-article">
          <p>
            After 17 seasons as a Soloist of The Royal Ballet in London&mdash;with
            roles created for him by some of the most celebrated choreographers alive,
            including Wayne McGregor, Crystal Pite, and Hofesh Shechter&mdash;Benjamin
            Ella retired in December 2025 and stepped into a new chapter rooted in
            choreography, faith, family, and sound money. His conversation with Bitcoin
            For The Arts founder Dion Wilson is one that could only happen between two
            professional dancers who found Bitcoin.
          </p>

          <p>
            Born in Melbourne to former ballet dancers Christine Walsh and Ricardo Ella,
            Benjamin initially trained as a tennis player before falling in love with the
            theater at age 11. Obsessed with videos of Carlos Acosta by 13&mdash;watching
            them three times a day&mdash;he won the Alicia Markova Bursary at 15 and moved
            to London for a full scholarship at The Royal Ballet School. His roommate was
            Vadim Muntagirov, now a principal of The Royal Ballet.
          </p>

          <p>
            Benjamin graduated injured&mdash;a stress fracture in his navicular that would
            plague him for three years, requiring surgery and two titanium pins. He nearly
            quit dancing in 2012. Director Dame Monica Mason&rsquo;s support kept him in
            the company during the darkest period. &ldquo;I really believe that if it was
            any other director I wouldn&rsquo;t have made it,&rdquo; he says. &ldquo;It&rsquo;s
            a miracle that I didn&rsquo;t get fired.&rdquo;
          </p>

          <p>
            His extensive repertory at The Royal Ballet included Albrecht and pas de six
            in <em>Giselle</em>, The Prince and Benno in <em>Swan Lake</em>,
            Hans-Peter/Nutcracker in <em>The Nutcracker</em>, Benvolio in <em>Romeo and
            Juliet</em>, and roles in <em>The Sleeping Beauty</em>, <em>Cinderella</em>,
            and <em>Alice&rsquo;s Adventures in Wonderland</em>. He created roles in
            Crystal Pite&rsquo;s <em>Flight Pattern</em> and <em>Light of Passage</em>,
            Wayne McGregor&rsquo;s <em>The Dante Project</em> and <em>Woolf Works</em>,
            and Hofesh Shechter&rsquo;s <em>Untouchable</em>, among others.
          </p>

          <p>
            Benjamin&rsquo;s Bitcoin journey began in 2015 with a small purchase he
            didn&rsquo;t understand. He drifted into altcoins in 2017&ndash;2018. The real
            shift came during COVID, when several forces converged: he was serving as a
            union deputy, negotiating dancer contracts and seeing the economics of arts
            institutions from the inside; he was reading <em>The Bitcoin Standard</em>
            and watching Robert Breedlove&rsquo;s &ldquo;What is Money?&rdquo; series
            with Michael Saylor; and governments were printing trillions.
          </p>

          <blockquote>
            <p>
              &ldquo;When you stumble onto something that&rsquo;s true&hellip; you
              can&rsquo;t unsee it.&rdquo;
            </p>
          </blockquote>

          <p>
            The tension was real. On one hand, he was developing libertarian leanings
            through Bitcoin. On the other, he was a union deputy negotiating for higher
            pay. &ldquo;When I first went in as a union representative I was like,
            &lsquo;This is unfair, we should be getting more money.&rsquo; Then as you
            actually get to understand the management side&hellip; I&rsquo;m like, okay,
            money doesn&rsquo;t work like that.&rdquo;
          </p>

          <p>
            His parents&rsquo; example shaped his understanding long before Bitcoin. They
            ran the Australian Conservatoire of Ballet&mdash;now a training program
            operating in 14 countries&mdash;without government grants, without boards
            telling them what to do. &ldquo;They were very much like: we&rsquo;d rather
            it be a little bit more difficult but we have control. We have freedom.&rdquo;
          </p>

          <p>
            Then Bitcoin led him somewhere unexpected: to Christianity. &ldquo;It was
            funnily enough the Bitcoin rabbit hole that got me interested in
            Christianity,&rdquo; he says. The deeper he went into the Bible, the more it
            deepened his convictions on Bitcoin.
          </p>

          <blockquote>
            <p>
              &ldquo;Proverbs 11:1&mdash;The Lord detests dishonest weights and scales.
              That&rsquo;s what money printing is. Dishonest scales and weights. I see
              Bitcoin as even weights and scales. Moral money.&rdquo;
            </p>
          </blockquote>

          <p>
            Benjamin revealed that Arts Council funding for The Royal Ballet has dropped
            from over 50% to just 19%&mdash;and it&rsquo;s still falling. The building
            needs complete refurbishment. &ldquo;The boilers are falling apart,&rdquo; he
            says. The old funding model is breaking in real time.
          </p>

          <p>
            His vision for the future includes a choreography studio in London running on
            a Bitcoin standard, a Bitcoin treasury for his church, and expanding his
            parents&rsquo; ballet training program with sound money at the foundation. He
            also tried to orange-pill The Royal Ballet&rsquo;s administration&mdash;twice.
            It didn&rsquo;t work. But he&rsquo;s playing the long game.
          </p>

          <p>
            For young dancers curious about Bitcoin, his advice is clear: &ldquo;Read
            <em>The Bitcoin Standard</em>. Buy a tiny bit of Bitcoin. Join a Bitcoin-only
            meetup. Don&rsquo;t ignore it at your own peril. This is not going away.&rdquo;
          </p>

          <p>
            When asked what a $500&ndash;$2,000 Bitcoin micro-grant from BFTA would
            unlock, Benjamin said he and his wife&mdash;who both choreograph&mdash;would
            use it to finally launch a collaborative project: hiring a studio, bringing
            in dancers, and getting it filmed. &ldquo;Everything costs money,&rdquo; he
            says. &ldquo;That grant would be: okay, let&rsquo;s actually make steps to
            make this piece happen.&rdquo;
          </p>

          <p>
            In Benjamin Ella, Bitcoin For The Arts finds something rare: a classical
            artist at the highest level who sees Bitcoin not as speculation but as
            moral money&mdash;even weights and scales in a world of dishonest ones.
            His story bridges the traditional arts establishment and the sovereign
            renaissance, proving that you can spend 17 years inside one of the most
            prestigious institutions in the world and still recognize that the system
            needs to change.
          </p>
        </div>

        {/* Artist links */}
        <div className="mt-14 rounded-2xl border border-[#d4af37]/40 bg-surface/50 p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
            Explore the Artist
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Learn more about Benjamin Ella&rsquo;s career and watch the full episode.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={links.royalBallet}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              Royal Ballet Profile
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H21m0 0v7.5m0-7.5l-11.25 11.25" />
              </svg>
            </a>
            <a
              href={links.episode}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              Watch Episode 4
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H21m0 0v7.5m0-7.5l-11.25 11.25" />
              </svg>
            </a>
            <a
              href={links.northernBallet}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              Northern Ballet
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
