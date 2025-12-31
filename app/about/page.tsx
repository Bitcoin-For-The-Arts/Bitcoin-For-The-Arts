import Image from "next/image";
import type { Metadata } from "next";
import logoImage from "../asset/BITCOIN-ARTS-LOGO-gold.jpg";
import watermarklogo from "../asset/FreedomLab Logo.jpeg";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Bitcoin for the Arts: mission, vision, and how we support artists with Bitcoin.",
};

export default function AboutPage() {
  return (
    <main className="bg-background relative">
      {/* Watermark */}
      <div className="fixed bottom-4 right-4 z-10 opacity-20 hover:opacity-40 transition-opacity duration-300">
      <a 
        href="https://btcnyc.github.io/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <Image
          src={watermarklogo}
          alt="Bitcoin for the Arts Watermark"
          width={80}
          height={80}
          className="rounded-full"
        />
      </a>
    </div>

      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <Image
            src={logoImage}
            alt="Bitcoin for the Arts Logo"
            width={300}
            height={300}
            className="rounded-full"
          />
        </div>
        <div className="mx-auto max-w-3xl">
          <p className="text-base leading-relaxed text-muted sm:text-lg mb-8">
            Bitcoin For The Arts, Inc. funds sovereign creators across visual arts,
            theater, dance, music, writing, storytelling, and film — artists with
            low time preference who craft timeless work, challenge censorship, and
            explore Bitcoin-aligned innovation. We provide BTC micro-grants, host
            workshops and residencies, and support live and digital productions.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12">
            <section className="rounded-2xl border border-border bg-surface p-6">
              <div className="text-xs font-bold uppercase tracking-wide text-foreground">
                Mission
              </div>
              <p className="mt-3 text-base leading-relaxed text-foreground/90 sm:text-lg italic">
                &ldquo;In the sovereign spirit of Bitcoin—uncensorable money for uncensorable minds—we ignite a self-sustaining global renaissance in arts. Through Bitcoin micro-grants, performance workshops, and visionary live and digital productions, we empower visual artists, playwrights, dancers, and musicians to break free from fiat decay. Every donation fuels direct support to creators, powers world-class exhibitions and residencies, and plants a seed in a permanent Bitcoin reserve—building an eternal endowment for human creativity that no institution or inflation can ever touch.&rdquo;
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-background p-6">
              <div className="text-xs font-bold uppercase tracking-wide text-foreground">
                Vision
              </div>
              <p className="mt-3 text-base leading-relaxed text-foreground/90 sm:text-lg">
                Be the NEA of the Bitcoin Era — the universal funder of interdisciplinary artists, powered by the hardest money ever known.
              </p>
            </section>
          </div>

          <p className="mt-10 text-base leading-relaxed text-muted sm:text-lg mb-6">
            Every donation in Bitcoin becomes a direct, instant grant that empowers a fine artist to create without gatekeepers — their work inscribed forever on the chain, their earnings protected from inflation and censorship.
          </p>

          <p className="text-base leading-relaxed text-muted sm:text-lg mb-6">
            Bitcoin saves the arts by replacing dying fiat patronage with unbreakable, global, inflation-proof capital — turning every artist into a sovereign creator and every collector into a living Medici.
          </p>

          <p className="text-base leading-relaxed text-muted sm:text-lg mb-6">
            We care because every artist we empower with Bitcoin is a soul we free — from fear, from gatekeepers, from a world that tells them their gift must beg to survive. Their art is sacred; their freedom is our mission.
          </p>

          <p className="text-base leading-relaxed text-muted sm:text-lg">
            We don&apos;t just teach Bitcoin — we pay you to live it: stack sats, slow down, and create art that outlives empires.
          </p>
        </div>
      </div>
    </main>
  );
}