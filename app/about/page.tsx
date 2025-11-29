import Image from "next/image";
import logoImage from "../asset/BITCOIN-ARTS-LOGO-gold.jpg";
import watermarklogo from "../asset/FreedomLab Logo.jpeg";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white relative">
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

      <div className="max-w-6xl mx-auto px-8 py-12">
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
        <div className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed mb-8">
            Bitcoin For The Arts, Inc. is the first nonprofit funding artists across all disciplines — visual, theater, dance, and music — using Bitcoin. We provide BTC micro-grants, host performance workshops and residencies, and co-produce live and digital works with museums, theaters, and orchestras.
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">Mission</h2>
          <p className="text-lg leading-relaxed mb-8 italic">
            &ldquo;In the sovereign spirit of Bitcoin—uncensorable money for uncensorable minds—we ignite a self-sustaining global renaissance in arts. Through Bitcoin micro-grants, performance workshops, and visionary live and digital productions, we empower visual artists, playwrights, dancers, and musicians to break free from fiat decay. Every donation fuels direct support to creators, powers world-class exhibitions and residencies, and plants a seed in a permanent Bitcoin reserve—building an eternal endowment for human creativity that no institution or inflation can ever touch.&rdquo;
          </p>

          <h2 className="text-3xl font-bold mt-12 mb-6">Vision</h2>
          <p className="text-lg leading-relaxed mb-8">
            Be the NEA of the Bitcoin Era — the universal funder of interdisciplinary artists, powered by the hardest money ever known.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            Every donation in Bitcoin becomes a direct, instant grant that empowers a fine artist to create without gatekeepers — their work inscribed forever on the chain, their earnings protected from inflation and censorship.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            Bitcoin saves the arts by replacing dying fiat patronage with unbreakable, global, inflation-proof capital — turning every artist into a sovereign creator and every collector into a living Medici.
          </p>

          <p className="text-lg leading-relaxed mb-6">
            We care because every artist we empower with Bitcoin is a soul we free — from fear, from gatekeepers, from a world that tells them their gift must beg to survive. Their art is sacred; their freedom is our mission.
          </p>

          <p className="text-lg leading-relaxed">
            We don&apos;t just teach Bitcoin — we pay you to live it: stack sats, slow down, and create art that outlives empires.
          </p>
        </div>
      </div>
    </main>
  );
}