'use client';

import { useState } from 'react';
import { track } from '@vercel/analytics';

interface BtcPayMembershipButtonProps {
  amount: number;
  tierName: string;
  label?: string;
  className?: string;
  tracking?: {
    tier: string;
    cadence: 'monthly' | 'annual';
    checkoutType?: 'one_time_invoice';
  };
}

export default function BtcPayMembershipButton({
  amount,
  tierName,
  label,
  className,
  tracking,
}: BtcPayMembershipButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      track('membership_checkout_click', {
        tier: tracking?.tier ?? tierName,
        cadence: tracking?.cadence ?? 'monthly',
        paymentMethod: 'bitcoin',
        checkoutType: tracking?.checkoutType ?? 'one_time_invoice',
      });

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
          'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border-2 border-accent bg-background px-5 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 disabled:opacity-60'
        }
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold leading-none text-black" aria-hidden="true">
          ₿
        </span>
        {isLoading ? 'Starting checkout…' : (label ?? 'Pay with Bitcoin')}
      </button>
      {error && (
        <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
