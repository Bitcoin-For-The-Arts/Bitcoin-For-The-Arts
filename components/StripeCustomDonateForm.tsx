'use client';

import { useState } from 'react';

type State =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'error'; message: string };

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
  }
  return 'Something went wrong. Please try again.';
}

export default function StripeCustomDonateForm() {
  const [amount, setAmount] = useState<string>('');
  const [coverFees, setCoverFees] = useState<boolean>(false);
  const [state, setState] = useState<State>({ status: 'idle' });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setState({ status: 'error', message: 'Please enter a valid amount.' });
      return;
    }

    setState({ status: 'submitting' });
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amountUsd: amt, coverFees }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true; url: string }
        | { ok: false; error?: string }
        | null;

      if (!res.ok || !data || !('ok' in data) || data.ok !== true || !('url' in data)) {
        const msg = data && 'error' in data && typeof data.error === 'string' ? data.error : '';
        throw new Error(msg || `Request failed (HTTP ${res.status}).`);
      }

      window.location.href = data.url;
    } catch (err) {
      setState({ status: 'error', message: getErrorMessage(err) });
    } finally {
      // keep the amount so user can try again
      if (state.status === 'submitting') setState({ status: 'idle' });
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-5 rounded-2xl border border-border bg-surface/60 p-5">
      <div className="text-sm font-semibold">Custom amount (Stripe Checkout)</div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Enter any amount. You’ll complete payment securely on Stripe. This checkout uses card payments only.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
        <label className="block sm:col-span-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted">
            Amount (USD)
          </div>
          <input
            inputMode="decimal"
            type="number"
            min="0.5"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (state.status === 'error') setState({ status: 'idle' });
            }}
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="25"
          />
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-border bg-background p-3 text-sm sm:col-span-1">
          <input
            type="checkbox"
            checked={coverFees}
            onChange={(e) => setCoverFees(e.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            Cover processing fees
            <div className="mt-1 text-xs text-muted">
              We gross-up the charge to approximately cover 2.9% + $0.30.
            </div>
          </span>
        </label>

        <button
          type="submit"
          disabled={state.status === 'submitting'}
          className={[
            'inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90',
            state.status === 'submitting' ? 'opacity-70 cursor-wait' : '',
          ].join(' ')}
        >
          {state.status === 'submitting' ? 'Redirecting…' : 'Donate now'}
        </button>
      </div>

      {state.status === 'error' ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </div>
      ) : null}
    </form>
  );
}

