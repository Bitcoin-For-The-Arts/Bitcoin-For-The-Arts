import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getMongoDb } from '@/lib/mongodb';

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

type BillingPortalTokenDoc = {
  token: string;
  email: string;
  customerId: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date | null;
  usedIp?: string | null;
};

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim() ?? '';
  if (!token) {
    return NextResponse.redirect(new URL('/billing?status=missing', req.url), 302);
  }

  const stripeKey = getEnv('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return NextResponse.redirect(new URL('/billing?status=unavailable', req.url), 302);
  }

  const db = await getMongoDb();
  const now = new Date();
  const ip = getClientIp(req);

  // One-time use: mark usedAt immediately to prevent reuse.
  const doc = await db.collection<BillingPortalTokenDoc>('billingPortalTokens').findOneAndUpdate(
    {
      token,
      expiresAt: { $gt: now },
      $or: [{ usedAt: null }, { usedAt: { $exists: false } }],
    },
    { $set: { usedAt: now, usedIp: ip } },
    { returnDocument: 'after' },
  );

  if (!doc) {
    return NextResponse.redirect(new URL('/billing?status=expired', req.url), 302);
  }

  const stripe = new Stripe(stripeKey);
  const baseUrl = getBaseUrl(req);
  const returnUrl = `${baseUrl}/billing`;
  const session = await stripe.billingPortal.sessions.create({
    customer: doc.customerId,
    return_url: returnUrl,
  });

  return NextResponse.redirect(session.url, 303);
}

