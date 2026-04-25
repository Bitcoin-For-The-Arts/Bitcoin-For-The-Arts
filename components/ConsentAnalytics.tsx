'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getCookieConsent, type CookieConsent } from './CookieBanner';

export default function ConsentAnalytics() {
  const [consent, setConsent] = useState<CookieConsent>(null);

  useEffect(() => {
    // Initial read from localStorage on mount (SSR-safe; getCookieConsent returns null on the server).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(getCookieConsent());

    function onConsentChange() {
      setConsent(getCookieConsent());
    }

    window.addEventListener('bfta-consent-change', onConsentChange);
    return () => window.removeEventListener('bfta-consent-change', onConsentChange);
  }, []);

  if (consent !== 'all') return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
