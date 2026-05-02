export default function SiteBackground() {
  // BFTA 2026 palette:
  //   #FF4F14 orange  -> rgba(255, 79, 20, …)
  //   #B3FF48 lime    -> rgba(179, 255, 72, …)
  //   #FFFAF0 cream   -> rgba(255, 250, 240, …)
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Mobile gets a little more color pop */}
      <div className="absolute inset-x-0 -top-32 h-[520px] sm:hidden bg-[linear-gradient(135deg,rgba(255,79,20,0.22),rgba(179,255,72,0.22),transparent)]" />
      {/* Mobile “sunrise” wash (enabled via body.mobile-vibrant) */}
      <div className="mobile-vibrant-sunset absolute inset-x-0 -top-40 h-[640px] bg-[linear-gradient(180deg,rgba(255,250,240,0.0),rgba(255,79,20,0.16),rgba(179,255,72,0.22))]" />

      {/* Abstract “wave” gradient — cream stage with soft brand washes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,79,20,0.28),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(179,255,72,0.30),transparent_45%),radial-gradient(circle_at_40%_85%,rgba(255,79,20,0.16),transparent_55%)] sm:bg-[radial-gradient(circle_at_20%_20%,rgba(255,79,20,0.20),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(179,255,72,0.22),transparent_45%),radial-gradient(circle_at_40%_85%,rgba(255,79,20,0.12),transparent_55%)]" />

      {/* Soft wash for readability (stronger on desktop) */}
      <div className="absolute inset-0 bg-background/45 sm:bg-background/60" />
    </div>
  );
}
