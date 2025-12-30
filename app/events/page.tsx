import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events',
  description: 'Events and meetups connected to Bitcoin for the Arts.',
};

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-8 uppercase tracking-tight">
            EVENTS
          </h1>
          
          <div className="space-y-6 mb-12">
            <p className="text-lg leading-relaxed text-muted">
              Join us for Bitcoin events in New York City. Connect with the Bitcoin community through our regular meetups and gatherings.
            </p>
            
            <div className="border-t border-border pt-8">
              <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight">
                DION WILSON
              </h2>
              <p className="text-muted mb-6">
                Bitcoin since 2017. Connecting Bitcoiner&apos;s with Bitcoiner&apos;s. Orange Pill App NYC Group Host, BitcoinWalk NYC Host, Bitcoin W/Coffee Host.
              </p>
              
              <a
                href="https://luma.com/user/dion"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-primary hover:opacity-90 text-white px-8 py-3 rounded-md transition-colors uppercase tracking-wide font-medium"
              >
                View Events on Luma
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
