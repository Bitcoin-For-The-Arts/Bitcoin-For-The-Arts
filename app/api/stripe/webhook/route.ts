import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getMongoDb } from '@/lib/mongodb';
import { sendResendEmail } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type StripeWebhookEventDoc = {
  _id: string; // Stripe event id
  type: string;
  livemode: boolean;
  created: Date;
  receivedAt: Date;
};

type DonationDoc = {
  createdAt: Date;
  stripeEventId: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  mode: string | null;
  paymentStatus: string | null;
  amountTotal: number | null;
  currency: string;
  customerEmail: string | null;
  customerName: string | null;
  metadata: Record<string, string>;
  livemode: boolean;
};

function getEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function asNumber(value: unknown) {
  const n = typeof value === 'string' ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : null;
}

function formatMoney(amountMinor: number, currency: string) {
  const upper = currency.toUpperCase();
  const dollars = (amountMinor / 100).toFixed(2);
  return `${upper} ${dollars}`;
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Safe config status endpoint (no secrets).
export async function GET() {
  const stripeSecretKey = Boolean(getEnv('STRIPE_SECRET_KEY'));
  const webhookSecret = Boolean(getEnv('STRIPE_WEBHOOK_SECRET'));
  const threshold = asNumber(getEnv('DONATION_THANKYOU_THRESHOLD_USD') ?? '50') ?? 50;

  let mongoOk = false;
  try {
    await getMongoDb();
    mongoOk = true;
  } catch {
    mongoOk = false;
  }

  return NextResponse.json(
    {
      ok: true,
      configured: {
        stripeSecretKey,
        stripeWebhookSecret: webhookSecret,
        mongo: mongoOk,
        resend: Boolean(getEnv('RESEND_API_KEY')) && Boolean(getEnv('RESEND_FROM_EMAIL')),
        thankYouThresholdUsd: threshold,
      },
      vercel: {
        env: process.env.VERCEL_ENV ?? null,
        url: process.env.VERCEL_URL ?? null,
      },
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(req: Request) {
  const webhookSecret = getEnv('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, error: 'Missing STRIPE_WEBHOOK_SECRET.' },
      { status: 500 },
    );
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { ok: false, error: 'Missing stripe-signature header.' },
      { status: 400 },
    );
  }

  const stripe = new Stripe(getEnv('STRIPE_SECRET_KEY') ?? 'sk_missing');

  let event: Stripe.Event;
  try {
    const raw = await req.arrayBuffer();
    const body = Buffer.from(raw);
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid signature.';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  // Idempotency: Stripe may retry events. Track processed event IDs.
  let db: Awaited<ReturnType<typeof getMongoDb>> | null = null;
  try {
    db = await getMongoDb();
    await db.collection<StripeWebhookEventDoc>('stripeWebhookEvents').insertOne({
      _id: event.id,
      type: event.type,
      livemode: event.livemode,
      created: new Date(event.created * 1000),
      receivedAt: new Date(),
    });
  } catch (err) {
    // Duplicate key means we already processed this event.
    if (
      err &&
      typeof err === "object" &&
      'code' in err &&
      (err as { code?: unknown }).code === 11000
    ) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }
    // If Mongo isn't configured, we still acknowledge the webhook to avoid retries.
    console.error('[stripe-webhook] mongo insert failed', err);
    db = null;
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentStatus = session.payment_status;
      if (paymentStatus !== 'paid') {
        return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
      }

      const amountTotal = session.amount_total ?? null;
      const currency = (session.currency ?? 'usd').toLowerCase();
      const customerEmail =
        (session.customer_details?.email ?? session.customer_email ?? null) || null;
      const customerName = session.customer_details?.name ?? null;

      // Store donation details (best-effort).
      if (db) {
        await db.collection<DonationDoc>('donations').updateOne(
          { stripeCheckoutSessionId: session.id },
          {
            $setOnInsert: {
              createdAt: new Date(),
              stripeEventId: event.id,
              stripeCheckoutSessionId: session.id,
              stripePaymentIntentId:
                typeof session.payment_intent === 'string'
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null,
              mode: session.mode ?? null,
              paymentStatus,
              amountTotal,
              currency,
              customerEmail,
              customerName,
              // Helpful metadata for later leaderboard work.
              metadata: session.metadata ?? {},
              livemode: event.livemode,
            },
          },
          { upsert: true },
        );
      }

      // Thank-you email for large donations (>= threshold USD).
      const thresholdUsd =
        asNumber(getEnv('DONATION_THANKYOU_THRESHOLD_USD') ?? '50') ?? 50;
      const qualifies =
        currency === 'usd' &&
        typeof amountTotal === 'number' &&
        amountTotal >= thresholdUsd * 100;

      if (qualifies && customerEmail) {
        const amountText = formatMoney(amountTotal, currency);
        const subject = `Thank you for your donation to Bitcoin for the Arts (${amountText})`;
        const text = [
          'Thank you for supporting Bitcoin for the Arts.',
          '',
          `Donation: ${amountText}`,
          '',
          'Your Stripe receipt should arrive automatically.',
          '',
          'With gratitude,',
          'Bitcoin for the Arts',
          'https://bitcoinforthearts.org',
        ].join('\n');

        const html = `
          <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
            <h2 style="margin: 0 0 12px;">Thank you for your donation.</h2>
            <p style="margin: 0 0 8px;">
              We appreciate your support for sovereign creators and Bitcoin-native arts.
            </p>
            <p style="margin: 0 0 8px;">
              <strong>Donation:</strong> ${escapeHtml(amountText)}
            </p>
            <p style="margin: 16px 0 0;">
              Your Stripe receipt should arrive automatically.
            </p>
            <p style="margin: 16px 0 0; color: #666; font-size: 12px;">
              Sent from <a href="https://bitcoinforthearts.org">bitcoinforthearts.org</a>
            </p>
          </div>
        `.trim();

        const fromEmail = getEnv('DONATIONS_FROM_EMAIL') ?? getEnv('RESEND_FROM_EMAIL') ?? undefined;
        const replyTo = getEnv('DONATIONS_REPLY_TO') ?? 'donate@bitcoinforthearts.org';

        const res = await sendResendEmail({
          to: customerEmail,
          subject,
          text,
          html,
          fromEmail,
          replyTo,
        });

        if (!res.ok && !res.skipped) {
          console.error('[stripe-webhook] thank-you email failed', res);
        }
      }
    }
  } catch (err) {
    console.error('[stripe-webhook] handler error', err);
    // Acknowledge to avoid retry loops; errors are logged and events are stored.
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

