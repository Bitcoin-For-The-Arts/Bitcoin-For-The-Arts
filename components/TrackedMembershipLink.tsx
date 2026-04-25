'use client';

import type { ReactNode } from 'react';
import { track } from '@vercel/analytics';

type MembershipCadence = 'monthly' | 'annual';
type PaymentMethod = 'traditional' | 'bitcoin';
type CheckoutType = 'subscription_link' | 'manual_email';

type TrackedMembershipLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
  tier: string;
  cadence: MembershipCadence;
  paymentMethod: PaymentMethod;
  checkoutType?: CheckoutType;
};

export default function TrackedMembershipLink({
  href,
  className,
  children,
  tier,
  cadence,
  paymentMethod,
  checkoutType,
}: TrackedMembershipLinkProps) {
  const isExternalWebUrl = href.startsWith('http://') || href.startsWith('https://');

  const handleClick = () => {
    track('membership_checkout_click', {
      tier,
      cadence,
      paymentMethod,
      checkoutType: checkoutType ?? (href.startsWith('mailto:') ? 'manual_email' : 'subscription_link'),
    });
  };

  return (
    <a
      href={href}
      target={isExternalWebUrl ? '_blank' : undefined}
      rel={isExternalWebUrl ? 'noopener noreferrer' : undefined}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
