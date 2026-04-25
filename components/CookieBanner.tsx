'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'bfta-cookie-consent';

export type CookieConsent = 'all' | 'essential' | null;

export function getCookieConsent(): CookieConsent {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(CONSENT_KEY);
  if (v === 'all' || v === 'essential') return v;
  return null;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Initial read from localStorage on mount (SSR-safe; getCookieConsent returns null on the server).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!getCookieConsent()) setVisible(true);
  }, []);

  function accept(choice: 'all' | 'essential') {
    localStorage.setItem(CONSENT_KEY, choice);
    setVisible(false);
    window.dispatchEvent(new Event('bfta-consent-change'));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-lg sm:p-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl text-sm leading-relaxed text-muted">
          We use cookies and similar technologies to operate this site and measure
          performance via privacy-friendly analytics. You can accept all cookies or
          limit your browser to essential cookies only.{' '}
          <Link
            href="/privacy-policy"
            className="font-semibold text-foreground underline underline-offset-4"
          >
            Privacy policy
          </Link>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <button
            type="button"
            onClick={() => accept('essential')}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => accept('all')}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
