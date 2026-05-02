import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function getClientIp(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') ?? 'unknown';
}

function getBaseUrl(req: NextRequest) {
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host = req.headers.get('host') ?? 'bitcoinforthearts.org';
  return `${proto}://${host}`;
}

// Best-effort in-memory rate limit (resets per server instance).
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12;
const rateLimit = new Map<string, number[]>();
function rateLimitOk(ip: string) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = rateLimit.get(ip) ?? [];
  const recent = timestamps.filter((t) => t > windowStart);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimit.set(ip, recent);
  return true;
}

type Body = {
  amountUsd?: number;
  coverFees?: boolean;
};

function asUsdCents(amountUsd: number) {
  // Stripe expects integer minor units.
  return Math.round(amountUsd * 100);
}

function grossUpForCardFees(netCents: number) {
  // Approximate Stripe card fee: 2.9% + $0.30.
  // gross = (net + 0.30) / (1 - 0.029)
  // Use cents: grossCents = ceil((netCents + 30) / 0.971)
  const gross = (netCents + 30) / 0.971;
  return Math.ceil(gross);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimitOk(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
  }

  const amountUsd = Number(body.amountUsd);
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return NextResponse.json(
      { ok: false, error: 'Please enter a valid donation amount.' },
      { status: 400 },
    );
  }

  const netCents = asUsdCents(amountUsd);
  if (!Number.isFinite(netCents) || netCents < 50) {
    return NextResponse.json(
      { ok: false, error: 'Minimum donation is $0.50.' },
      { status: 400 },
    );
  }

  const coverFees = Boolean(body.coverFees);
  const chargeCents = coverFees ? grossUpForCardFees(netCents) : netCents;

  // Guardrail: avoid absurd values.
  if (chargeCents > 1_000_000_00) {
    return NextResponse.json(
      { ok: false, error: 'Donation amount is too large. Please contact us.' },
      { status: 400 },
    );
  }

  // Use a dedicated key for donations if provided, so you can keep the billing portal key locked down.
  // Recommended for restricted keys: enable Checkout Sessions (write) + the required payment permissions.
  const stripeKey = getEnv('STRIPE_DONATIONS_SECRET_KEY') ?? getEnv('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Card donation checkout is not configured yet. Please use the donation link options below.',
      },
      { status: 503 },
    );
  }
  if (!stripeKey.startsWith('sk_') && !stripeKey.startsWith('rk_')) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Card donation checkout is misconfigured. Please use the donation link options below.',
      },
      { status: 503 },
    );
  }

  const stripe = new Stripe(stripeKey);
  const baseUrl = getBaseUrl(req);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${baseUrl}/donate?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/donate?status=cancelled`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: chargeCents,
            product_data: {
              name: coverFees ? 'Donation (covers processing fees)' : 'Donation',
              description: coverFees
                ? 'Includes an extra amount to help cover processing fees.'
                : 'Thank you for supporting Bitcoin for the Arts.',
            },
          },
        },
      ],
      metadata: {
        type: 'donation_one_time_custom',
        cover_fees: coverFees ? 'true' : 'false',
        desired_net_cents: String(netCents),
        charged_cents: String(chargeCents),
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { ok: false, error: 'Stripe did not return a checkout URL.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, url: session.url }, { status: 200 });
  } catch (err) {
    const e = err as { type?: unknown; code?: unknown; message?: unknown };
    const type = typeof e.type === 'string' ? e.type : '';
    const code = typeof e.code === 'string' ? e.code : '';
    const msg = typeof e.message === 'string' ? e.message : '';
    console.error('[stripe] create checkout session failed', { type, code, msg });

    // Friendly guidance for the common case: restricted keys missing permissions.
    const isPermission =
      code === 'permission_denied' ||
      msg.toLowerCase().includes('permission') ||
      msg.toLowerCase().includes('not allowed');

    return NextResponse.json(
      {
        ok: false,
        error: isPermission
          ? 'Stripe is not authorized to create Checkout Sessions. If you are using a restricted key, enable Checkout Sessions (write) and the required payment permissions, or set STRIPE_DONATIONS_SECRET_KEY to a key with those permissions.'
          : 'Unable to start checkout right now. Please try again, or use the donation link options below.',
      },
      { status: 502 },
    );
  }
}

