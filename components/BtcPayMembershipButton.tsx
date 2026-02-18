'use client';

import { useState } from 'react';

interface BtcPayMembershipButtonProps {
  amount: number;
  tierName: string;
  label?: string;
  className?: string;
}

export default function BtcPayMembershipButton({
  amount,
  tierName,
  label,
  className,
}: BtcPayMembershipButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/btcpay/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'USD',
          redirectUrl: `${window.location.origin}/donate/monthly`,
          metadata: {
            orderId: `membership-${tierName.toLowerCase().replace(/\s+/g, '-')}`,
            message: `Sovereign Circle membership: ${tierName} ($${amount})`,
          },
        }),
      });

      const data = (await res.json()) as
        | { checkoutLink: string }
        | { error: string; details?: string };

      if (!res.ok) {
        const details =
          'details' in data && data.details ? `\n${data.details}` : '';
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
    <div className="w-full">
      <button
        type="button"
        disabled={isLoading}
        onClick={handleClick}
        className={
          className ??
          'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface disabled:opacity-60'
        }
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M14.24 10.56c-.31 1.24-2.24.73-2.88.58l.55-2.18c.64.16 2.67.47 2.33 1.6zm-1.31 2.5c-.36 1.46-2.68.68-3.44.5l.63-2.5c.75.18 3.18.54 2.81 2zm1.43-7.56c-1.96-2.54-6.49-1.36-8.74-.47l-.71 2.87c1.01-.35 2.33-.79 3.59-.62-.36 1.43-3.37 1.6-3.63 2.68l-.65 2.59c.61-.17 1.98-.63 3.41-.58-.4 1.58-3.36 1.73-3.67 2.97l-.72 2.83c2.26-.88 6.73-2.06 8.71.45 1.4 1.76.24 4.4-2.36 5.33 2.97-.56 5.91-2.78 6.15-5.99.19-2.54-1.19-4.09-2.75-4.72 1.1-.95 1.67-2.76 1.37-4.34-.19-1.04-.72-2.2-1.72-3-.24-.2-.5-.38-.78-.54l.5-2z"
          />
        </svg>
        {isLoading ? 'Starting checkout…' : (label ?? `Pay with Bitcoin`)}
      </button>
      {error && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
