export default function SiteBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* Abstract “wave” gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,147,26,0.22),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(126,87,194,0.22),transparent_45%),radial-gradient(circle_at_40%_85%,rgba(38,166,154,0.14),transparent_55%)]" />
      {/* Soft wash for readability */}
      <div className="absolute inset-0 bg-background/55" />
    </div>
  );
}

