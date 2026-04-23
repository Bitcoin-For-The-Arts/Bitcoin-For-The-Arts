/* eslint-disable @next/next/no-sync-scripts */
'use client';

import Script from 'next/script';
import { useState } from 'react';

type State =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return 'Something went wrong. Please try again.';
}

export default function BillingPortalRequestForm() {
  const [state, setState] = useState<State>({ status: 'idle' });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot
    if (String(fd.get('company') ?? '').trim()) {
      setState({ status: 'success' });
      form.reset();
      return;
    }

    if (TURNSTILE_SITE_KEY) {
      const token = String(fd.get('cf-turnstile-response') ?? '').trim();
      if (!token) {
        setState({ status: 'error', message: 'Please complete the anti-spam verification and try again.' });
        return;
      }
    }

    const email = String(fd.get('email') ?? '').trim();
    if (!email) {
      setState({ status: 'error', message: 'Please enter your email address.' });
      return;
    }

    setState({ status: 'submitting' });
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Request failed (HTTP ${res.status}).`);
      }
      setState({ status: 'success' });
      form.reset();
    } catch (err) {
      setState({ status: 'error', message: getErrorMessage(err) });
    }
  };

  if (state.status === 'success') {
    return (
      <div>
        <div className="text-sm font-semibold">Check your email.</div>
        <div className="mt-2 text-sm text-muted">
          We sent you a secure subscription management link (if available) for that email address.
          If you don’t see it, check spam or email{' '}
          <a className="underline underline-offset-4" href="mailto:donate@bitcoinforthearts.org">
            donate@bitcoinforthearts.org
          </a>
          .
        </div>
        <button
          type="button"
          onClick={() => setState({ status: 'idle' })}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 py-2 text-sm font-semibold transition-colors hover:bg-surface"
        >
          Send another link
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {TURNSTILE_SITE_KEY ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      ) : null}

      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-semibold">Email used for your donation</div>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </label>

      {TURNSTILE_SITE_KEY ? (
        <div className="flex justify-center">
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-theme="auto" data-size="flexible" />
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className={[
          'inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-colors hover:opacity-90',
          state.status === 'submitting' ? 'opacity-70 cursor-wait' : '',
        ].join(' ')}
      >
        {state.status === 'submitting' ? 'Sending…' : 'Email me a portal link'}
      </button>
    </form>
  );
}

