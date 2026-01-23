'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  defaultAmount?: number;
};

export default function BtcPayDonateWidget({
  defaultAmount = 25,
}: Props) {
  const [amountInput, setAmountInput] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggested = useMemo(() => [11, 21, 51, 101], []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = new URLSearchParams(window.location.search).get('amount');
      const parsed = raw ? Number(raw) : Number.NaN;
      if (Number.isFinite(parsed) && parsed > 0) {
        setAmountInput(String(parsed));
        return;
      }
    }
    if (Number.isFinite(defaultAmount) && defaultAmount > 0) {
      setAmountInput(String(defaultAmount));
      return;
    }
    setAmountInput('');
  }, [defaultAmount]);

  const createInvoice = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const parsedAmount = Number(amountInput);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new Error('Enter a valid amount to donate.');
      }
      const currency = 'USD';
      const res = await fetch('/api/btcpay/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          currency,
          redirectUrl: `${window.location.origin}/donate`,
          metadata: message ? { message } : undefined,
        }),
      });

      const data = (await res.json()) as
        | { checkoutLink: string }
        | { error: string; details?: string };

      if (!res.ok) {
        const details =
          'details' in data && data.details ? `\n\n${data.details}` : '';
        throw new Error(('error' in data ? data.error : 'Error') + details);
      }

      if (!('checkoutLink' in data) || !data.checkoutLink) {
        throw new Error('BTCPay did not return a checkout link.');
      }

      window.location.href = data.checkoutLink;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start checkout.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="text-sm font-semibold tracking-tight">
        Donate with BTCPay (BTC + Lightning)
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Choose an amount and you’ll be redirected to a secure BTCPay checkout that
        supports on-chain Bitcoin and Lightning.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12 md:items-start">
        <div className="md:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                Amount (USD)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amountInput}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    setAmountInput('');
                    setError(null);
                    return;
                  }
                  const digitsOnly = raw.replace(/[^\d]/g, '');
                  const normalized = digitsOnly.replace(/^0+(?=\d)/, '');
                  setAmountInput(normalized);
                  setError(null);
                }}
                onFocus={(e) => {
                  e.target.select();
                }}
                className="mt-2 min-h-12 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {suggested.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setAmountInput(String(v));
                      setError(null);
                    }}
                    className="min-h-12 rounded-md border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface"
                  >
                    ${v}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs text-muted">
                We convert USD to BTC/Lightning at checkout.
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Optional note"
            />
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 whitespace-pre-wrap">
              {error}
            </div>
          ) : null}

          <div className="mt-5">
            <button
              type="button"
              disabled={isLoading}
              onClick={createInvoice}
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {isLoading ? 'Starting checkout…' : 'Continue to checkout'}
            </button>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Note
            </div>
            <p className="mt-2 leading-relaxed">
              Your BTCPay Server must be reachable at a public HTTPS URL. Tor
              (.onion) and LAN (.local) addresses won’t work with a public site on
              Vercel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

