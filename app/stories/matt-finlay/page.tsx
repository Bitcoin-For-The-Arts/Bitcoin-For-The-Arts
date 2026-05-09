import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Matt Finlay – Dissident Beats from the World's Longest Lockdown | Bitcoin for the Arts",
  description:
    "Matt Finlay, a Melbourne-based dissident musician, turned lockdown tyranny into raw, unapologetic art — and found a censorship-resistant home on Nostr and the ValueVerse.",
};

const links = {
  phafe: "https://phafe.com/artists/mattfinlay/",
  bandcamp: "https://mattfinlay.bandcamp.com/",
  substack: "https://mattfinlay.substack.com/",
  rumble: "https://rumble.com/user/MattFinlay",
  thinBlueLine:
    "https://rumble.com/v2hr2hs-thin-blue-line-432hz-music-video-matt-finlay.html",
  nostr:
    "https://primal.net/p/nprofile1qqs9pf3ueg2mz6mq6v5mjtmz33pjerqjdzd5pl5aqj27hqmttuklvdc8u3cgl",
  kofi: "https://ko-fi.com/mattfinlay",
};

const extLink =
  "underline decoration-accent/40 underline-offset-2 transition-colors hover:text-accent hover:decoration-accent";

export default function MattFinlayPage() {
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
                src="/Matt-Finlay-BFTA-Artist.jpg"
                alt="Matt Finlay"
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Matt Finlay
              </h1>
              <p className="mt-2 text-lg text-white/70 font-[var(--font-display)] italic">
                Dissident Beats from the World&rsquo;s Longest Lockdown
              </p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-white/50">
                Bitcoin For The Arts, Inc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Article body */}
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <div className="prose-article">
          <p>
            In the shadow of Melbourne&rsquo;s brutal 2020&ndash;2021
            lockdowns&mdash;the longest and most severe in the
            world&mdash;Matt Finlay picked up his instruments and refused to
            stay silent. While many artists he once admired either stayed quiet
            or actively supported government overreach, Finlay did the opposite:
            he began releasing raw, unapologetic dissident music that called out
            tyranny, loss of liberty, and the erosion of basic human rights. A
            musician, independent artist, and fierce defender of free expression,
            Finlay is now a featured voice in Bitcoin For The Arts, Inc. (BFTA).
            His work stands as a sonic manifesto for artistic sovereignty in an
            age when platforms censor, governments control, and fiat systems
            punish dissent.
          </p>

          <p>
            Finlay&rsquo;s story is one of courage born from disillusionment. A
            lifelong creator, he watched in disbelief as the city he called home
            enforced some of the strictest pandemic measures on the planet. He
            lost friends, family relationships, and employment for taking a
            public stand through his art. His music was repeatedly censored and
            shadow-banned across major platforms. Instead of retreating, he
            doubled down. He began releasing his work for free on a
            pay-what-you-want model, refusing to let financial pressure or
            platform gatekeepers dictate his message.
          </p>

          <p>
            When he discovered{" "}
            <a href={links.nostr} target="_blank" rel="noopener noreferrer" className={extLink}>
              Nostr
            </a>{" "}
            and the ValueVerse, everything changed. Here was a
            censorship-resistant home where he could finally connect directly
            with listeners who valued his work. &ldquo;I am happily returning
            the value I have received for my music back into the ValueVerse
            where I gain much value,&rdquo; he says. Although he is still early
            in his Bitcoin journey and has not yet been able to purchase or mine
            BTC (Australian banks have been known to lock accounts for simply
            buying Bitcoin), he sees the clear philosophical alignment: Bitcoin
            offers the same freedom and permissionless expression he fights for
            through his music.
          </p>

          <p>
            Finlay&rsquo;s creative process is fiercely independent. He performs
            and records nearly all instruments himself, experimenting with
            genres, non-conventional rhythms, and harmonic surprises. He embeds
            solfeggio frequencies and records most of his music in 432Hz tuning,
            seeking a deeper emotional and spiritual resonance. His favorite
            piece, &ldquo;Thin Blue Line,&rdquo; is a haunting, brutal yet
            sympathetic track that tells the story of a police officer enforcing
            state tyranny. The{" "}
            <a href={links.thinBlueLine} target="_blank" rel="noopener noreferrer" className={extLink}>
              music video
            </a>
            , hosted on Rumble, contains raw, shocking footage from the Melbourne
            lockdowns&mdash;some of it captured by Finlay&rsquo;s own friends.
          </p>

          <p>
            Through his art, Finlay expresses sovereignty in its purest form:
            total creative independence. He refuses to compromise his message for
            algorithms or corporate platforms. He has already onboarded two other
            musicians to the Value-for-Value model and Nostr, and he actively
            creates content to help others escape centralized platforms. His
            philosophy is clear: &ldquo;Be brave. Risk being cancelled to
            express yourself. Embrace censorship-resistant protocols and turn
            your back on the platforms.&rdquo;
          </p>

          <blockquote>
            <p>
              &ldquo;Be brave. Risk being cancelled to express yourself. Embrace
              censorship-resistant protocols and turn your back on the
              platforms.&rdquo;
            </p>
          </blockquote>

          <p>
            Bitcoin has given Finlay a new lens and a new home. The peer-to-peer
            nature of the ValueVerse aligns perfectly with his desire for direct
            connection between artist and audience. While he is still learning
            the technical side of Bitcoin, the philosophical impact is already
            profound&mdash;it represents the possibility of creating without
            permission, distributing without intermediaries, and sustaining a
            career on true value-for-value terms.
          </p>

          <p>
            In Matt Finlay, Bitcoin For The Arts finds a powerful example of what
            the sovereign renaissance looks like in practice: an artist who
            refused to stay silent when it mattered most, who turned personal
            loss into powerful music, and who continues to blaze a trail for
            others seeking artistic and financial independence.
          </p>

          <p>
            We are proud to feature his story and look forward to sharing more
            of his music and journey with our community.
          </p>
        </div>

        {/* Artist links */}
        <div className="mt-14 rounded-2xl border border-[#d4af37]/40 bg-surface/50 p-6 sm:p-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#d4af37]">
            Explore the Artist
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Listen to Matt Finlay&rsquo;s music, follow him on Nostr, and
            support his work through the ValueVerse.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={links.phafe}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              Phafe
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H21m0 0v7.5m0-7.5l-11.25 11.25" />
              </svg>
            </a>
            <a
              href={links.bandcamp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              Bandcamp
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H21m0 0v7.5m0-7.5l-11.25 11.25" />
              </svg>
            </a>
            <a
              href={links.nostr}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              Nostr
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H21m0 0v7.5m0-7.5l-11.25 11.25" />
              </svg>
            </a>
            <a
              href={links.thinBlueLine}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-[#d4af37] px-5 py-2.5 text-sm font-semibold text-[#d4af37] transition-colors hover:bg-[#d4af37]/10"
            >
              Thin Blue Line (Rumble)
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
