'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'bfta_home_webinar_promo_dismissed_session';

function isEnabled() {
  return process.env.NEXT_PUBLIC_SHOW_WEBINAR_PROMO === '1';
}

export function isWebinarPromoConfigured() {
  const url = (process.env.NEXT_PUBLIC_WEBINAR_SIGNUP_URL ?? '').trim();
  return isEnabled() && Boolean(url);
}

export default function HomeWebinarPromo() {
  const enabled = isEnabled();
  const [open, setOpen] = useState(false);

  const config = useMemo(() => {
    const signupUrl = (process.env.NEXT_PUBLIC_WEBINAR_SIGNUP_URL ?? '').trim();
    const title =
      (process.env.NEXT_PUBLIC_WEBINAR_TITLE ?? '').trim() ||
      'Bitcoin for Artists — Live Webinar';
    const dateText =
      (process.env.NEXT_PUBLIC_WEBINAR_DATE_TEXT ?? '').trim() ||
      'Feb 8 • 12:00 PM ET';
    const body =
      (process.env.NEXT_PUBLIC_WEBINAR_BODY_TEXT ?? '').trim() ||
      'A fast, practical intro for artists: wallets, custody basics, and getting started.';
    const flyerSrc = (process.env.NEXT_PUBLIC_WEBINAR_FLYER_SRC ?? '').trim();

    return { signupUrl, title, dateText, body, flyerSrc };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === 'undefined') return;

    // Only show if configured.
    if (!config.signupUrl) return;

    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      // ignore
    }

    // Show quickly, but give the page a moment to settle.
    const t = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(t);
  }, [config.signupUrl, enabled]);

  if (!enabled) return null;
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[55] px-4 sm:bottom-6">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-primary/95 text-white shadow-2xl backdrop-blur sm:border-border sm:bg-background sm:text-foreground">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(247,147,26,0.18),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(126,87,194,0.16),transparent_55%)]" />

          <div className="relative grid grid-cols-1 gap-4 p-5 sm:grid-cols-[112px_1fr_auto] sm:items-center sm:gap-5">
            {config.flyerSrc ? (
              <div className="relative h-28 w-full overflow-hidden rounded-xl border border-white/15 bg-black/10 sm:h-20 sm:w-28 sm:border-border">
                <Image
                  src={config.flyerSrc}
                  alt="Webinar flyer"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 90vw, 112px"
                />
              </div>
            ) : (
              <div className="hidden sm:block">
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 sm:border-border sm:bg-surface sm:text-muted">
                  Live webinar
                </div>
                <div className="mt-2 text-sm font-semibold">{config.dateText}</div>
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80 sm:border-border sm:bg-surface sm:text-muted sm:hidden">
                  Live webinar · {config.dateText}
                </div>
                <div className="text-lg font-semibold tracking-tight">{config.title}</div>
              </div>
              <div className="mt-2 text-sm leading-relaxed text-white/80 sm:text-muted">
                {config.body}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <a
                href={config.signupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                Sign up
              </a>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  try {
                    window.sessionStorage.setItem(STORAGE_KEY, '1');
                  } catch {
                    // ignore
                  }
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15 sm:border-border sm:bg-background sm:text-foreground sm:hover:bg-surface"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

