import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <div className="text-sm font-semibold uppercase tracking-wide">
              Bitcoin for the Arts
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A nonprofit supporting artists with Bitcoin micro-grants, workshops,
              residencies, and productions — with radical transparency.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                Organization
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:underline">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/grants" className="hover:underline">
                    Grants
                  </Link>
                </li>
                <li>
                  <Link href="/programming" className="hover:underline">
                    Programming
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                Community
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/events" className="hover:underline">
                    Events
                  </Link>
                </li>
                <li>
                  <Link href="/stories" className="hover:underline">
                    Stories
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:underline">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                Legal
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/privacy-policy" className="hover:underline">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="/donate" className="hover:underline">
                    Donate
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            © {new Date().getFullYear()} Bitcoin for the Arts. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a
              href="mailto:hello@bitcoinforthearts.org"
              className="hover:underline"
            >
              hello@bitcoinforthearts.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

