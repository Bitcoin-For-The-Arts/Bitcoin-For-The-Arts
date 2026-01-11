'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { isValidBitcoinOnchainAddress } from '@/lib/bitcoinAddress';

type State =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

export default function BoardNominationForm() {
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    if (state.status !== 'error') return;
    const w = window as unknown as { turnstile?: { reset?: () => void } };
    if (typeof w.turnstile?.reset === 'function') {
      try {
        w.turnstile.reset();
      } catch {
        // ignore
      }
    }
  }, [state.status]);

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

    const nomineeWallet = String(fd.get('nomineeWallet') ?? '').trim();
    if (nomineeWallet && !isValidBitcoinOnchainAddress(nomineeWallet)) {
      setState({
        status: 'error',
        message: 'Nominee BTC address looks invalid. Please use an on-chain address (bc1…, 1…, or 3…).',
      });
      return;
    }

    if (TURNSTILE_SITE_KEY) {
      const token = String(fd.get('cf-turnstile-response') ?? '').trim();
      if (!token) {
        setState({
          status: 'error',
          message: 'Please complete the anti-spam verification and try again.',
        });
        return;
      }
    }

    const payload = Object.fromEntries(fd.entries());

    setState({ status: 'submitting' });
    try {
      const res = await fetch('/api/governance/board-nomination', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Submission failed (HTTP ${res.status}).`);
      }
      setState({ status: 'success' });
      form.reset();
    } catch (err) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : '';
      setState({ status: 'error', message: msg || 'Something went wrong. Please try again.' });
    }
  };

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-border bg-background p-6">
        <div className="font-semibold">Nomination received.</div>
        <div className="mt-2 text-sm text-muted">
          Thanks for helping build BFTA’s governance. If the nominee is shortlisted, we’ll reach out.
        </div>
        <button
          type="button"
          onClick={() => setState({ status: 'idle' })}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-2 text-sm font-semibold transition-colors hover:opacity-90"
        >
          Submit another nomination
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {TURNSTILE_SITE_KEY ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      ) : null}

      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Your information
        </div>

        <label className="block">
          <div className="text-sm font-semibold">
            Your name <span className="text-accent">*</span>
          </div>
          <input
            name="nominatorName"
            required
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Your name"
          />
        </label>

        <label className="block">
          <div className="text-sm font-semibold">
            Your email <span className="text-accent">*</span>
          </div>
          <input
            name="nominatorEmail"
            type="email"
            required
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm font-semibold">Your relationship to BFTA (optional)</div>
          <input
            name="nominatorRelationship"
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Donor, artist, partner, volunteer…"
          />
        </label>

        <div className="md:col-span-2 mt-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Nominee information
        </div>

        <label className="block">
          <div className="text-sm font-semibold">
            Nominee name <span className="text-accent">*</span>
          </div>
          <input
            name="nomineeName"
            required
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Nominee name"
          />
        </label>

        <label className="block">
          <div className="text-sm font-semibold">
            Nominee email <span className="text-accent">*</span>
          </div>
          <input
            name="nomineeEmail"
            type="email"
            required
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="nominee@example.com"
          />
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm font-semibold">
            Nominee bio / background <span className="text-accent">*</span>
          </div>
          <textarea
            name="nomineeBio"
            required
            rows={5}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Arts experience, Bitcoin involvement, governance/finance/legal background…"
          />
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm font-semibold">
            Why this nominee fits BFTA’s board <span className="text-accent">*</span>
          </div>
          <textarea
            name="nomineeFit"
            required
            rows={5}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Grants, education/programs, finance/endowment, operations, sovereignty alignment…"
          />
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm font-semibold">Nominee Bitcoin wallet address (optional)</div>
          <input
            name="nomineeWallet"
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="bc1…, 1…, or 3…"
          />
          <div className="mt-2 text-xs text-muted">
            Optional—used only as a signal of Bitcoin familiarity. We do not require KYC.
          </div>
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm font-semibold">Additional comments (optional)</div>
          <textarea
            name="additionalComments"
            rows={3}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Anything else you want the board to know…"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 text-xs text-muted">
        We respect your privacy. Data is used solely for nomination review. Nominees will be contacted only if shortlisted.
      </div>

      {TURNSTILE_SITE_KEY ? (
        <div className="flex justify-center">
          <div
            className="cf-turnstile"
            data-sitekey={TURNSTILE_SITE_KEY}
            data-theme="auto"
            data-size="flexible"
            data-action="board_nomination"
          />
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
          'inline-flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 border border-accent/60',
          state.status === 'submitting' ? 'opacity-70 cursor-wait' : '',
        ].join(' ')}
      >
        {state.status === 'submitting' ? 'Submitting…' : 'Submit nomination'}
      </button>
    </form>
  );
}

