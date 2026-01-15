import Link from 'next/link';

const paragraphs = [
  'As Orange Piller ⚡️, a former professional dancer and proud Bitcoiner based in New York City, my journey to founding Bitcoin for the Arts, Inc. (BFTA) in 2025 stems from a deeply personal intersection of creativity, financial hardship, and a revolutionary vision for empowerment. Having toured nationally with Disney\'s The Lion King as a concert dancer with multiple dance companies, I experienced firsthand the exhilarating highs of artistic expression and the crushing lows of an economic system stacked against creators. BFTA was born from these struggles, aiming to ignite a self-sustaining global renaissance in the arts through Bitcoin micro-grants, workshops, residencies, and productions. Our mission, "Uncensorable money • Uncensorable minds," is a direct response to the systemic failures of the fiat world, positioning BFTA as the "NEA of the Bitcoin Era" with radical transparency, a 55/30/10/5 donation allocation rule, and a permanent Bitcoin endowment.',
  'The economic landscape for artists today is a battlefield of instability and exploitation, exacerbated by the fiat system\'s inherent flaws. As I discussed in my PubKey talk, the global economy is plagued by never-ending inflation, a structural byproduct of central banks\' endless money printing. This "fiat decay" erodes purchasing power relentlessly. Artists\' grants, royalties, and gig payments lose value over time, turning hard-earned income into diminishing returns. In the U.S. alone, inflation has averaged 3-4% annually, but for creatives living paycheck-to-paycheck, it feels like a silent thief, compounding the cost of living in high-expense hubs like NYC. Globally, hyperinflation in places like Argentina or Turkey devastates artists even more, forcing them to chase fiat that\'s designed to devalue.',
  'Compounding this is the chronic lack of funding and repeated cuts to arts support. In New York City, where I built my career, the arts budget has faced slashes. Recent proposals threatened $53 million in reductions, leaving programs like residencies at BAM or the Whitney underfunded. Nationally, the NEA\'s budget hovers around $200 million annually, a fraction of what\'s needed for 2.5 million U.S. artists, many of whom earn below $30,000 a year. During economic downturns or policy shifts, arts funding is often the first casualty, leaving creators without safety nets. As a dancer, I saw colleagues sidelined by canceled tours or defunded theaters, highlighting how reliant the arts are on fragile fiat grants that can vanish overnight.',
  'Artists are routinely taken advantage of in this system, rarely truly owning their work or earning fair pay. Platforms and intermediaries, galleries, streaming services, or production companies extract hefty cuts, leaving creators with scraps. Dancers like me often work grueling hours for minimal compensation, with contracts that sign away rights to choreography or performances. In music and visual arts, NFTs promised ownership but fiat\'s volatility and scams devoured many. Struggling is the norm: 60% of artists hold multiple jobs, facing poverty rates double the national average. As a Bitcoiner, I realized fiat\'s design incentivizes this exploitation. Centralized control enables gatekeepers to undervalue timeless craft.',
  'Moreover, artists\' lack of financial savvy makes them easy prey in the fiat jungle. Most creatives, focused on their craft, aren\'t equipped to navigate taxes, investments, or inflation hedging. I wasn\'t either, early on. Dancers rarely learn about compounding interest or asset protection amid irregular income. This vulnerability leads to debt traps, poor contracts, and lost opportunities, as fiat\'s complexity devours savings. Bitcoin changed that for me: its fixed supply (21 million cap) and censorship resistance offer a lifeline, sound money that can\'t be inflated away.',
  'These realities drove me to start BFTA: to empower artists with uncensorable tools for sovereignty. By paying in Bitcoin, we break free from fiat\'s chains, direct grants via the Lightning Network for instant, borderless support; workshops teaching wallet setup and endowment building; and an eternal HODL Vault that compounds value over time. Our 55% to grants ensures immediate impact, while the 5% reserve builds a legacy no inflation can touch. As a former dancer turned Bitcoiner, I founded BFTA to stack culture on sound money, turning struggling creators into sovereign ones. Join us in this renaissance, because artists deserve more than survival; they deserve to thrive.',
];

export default function ReasonForFormationScroll() {
  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(126,87,194,0.25),_transparent_65%)]" />

      <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Reason for Formation</span>
          </div>
          <Link
            href="/about/leadership/dion-wilson"
            className="inline-flex items-center justify-center rounded-md border border-border bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-surface"
          >
            Founder bio
          </Link>
        </div>

        <section className="mt-10 rounded-3xl border border-border bg-background/80 p-8 shadow-sm backdrop-blur sm:p-10">
          <div className="mx-auto max-w-3xl text-left text-lg leading-relaxed text-foreground sm:text-xl md:text-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-5xl">
              Why I Founded Bitcoin for the Arts (BFTA)
            </h1>

            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 12)} className="mt-6 text-foreground/90">
                {paragraph}
              </p>
            ))}

            <div className="mt-10 space-y-1 text-foreground">
              <p className="text-xl font-semibold sm:text-2xl">Sincerely,</p>
              <p className="text-xl font-semibold sm:text-2xl">Orange Piller ⚡️</p>
              <p className="text-base font-semibold uppercase tracking-wide text-muted">
                Founder &amp; Director
              </p>
              <p className="text-base font-semibold uppercase tracking-wide text-muted">
                Bitcoin for the Arts, Inc.
              </p>
              <a
                href="https://x.com/Orangepillman"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-semibold text-primary hover:underline"
              >
                @Orangepillman
              </a>
              <a
                href="https://primal.net/DionWilson"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary break-all hover:underline"
              >
                npub:npub1r53a5pazpuwlrpdf576uz58zq8q85jhyycsxx9m8wu00fvefrktsvy5wyx
              </a>
            </div>
          </div>
        </section>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted">
            Read the full founder bio for the story behind the mission.
          </p>
          <Link
            href="/about/leadership/dion-wilson"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            View founder bio
          </Link>
        </div>
      </div>
    </main>
  );
}
