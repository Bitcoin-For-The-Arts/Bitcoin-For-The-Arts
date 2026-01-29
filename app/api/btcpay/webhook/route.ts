import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getMongoDb } from '@/lib/mongodb';
import { sendResendEmail } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

function safeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyBtcPaySignature(args: { rawBody: Buffer; signatureHeader: string; secret: string }) {
  // BTCPay uses an HMAC-SHA256 signature in header `BTCPay-Sig` formatted as: `sha256=<hex>`
  const raw = args.signatureHeader.trim();
  const provided = raw.startsWith('sha256=') ? raw.slice('sha256='.length) : raw;
  if (!/^[a-f0-9]{64}$/i.test(provided)) return false;
  const computed = crypto
    .createHmac('sha256', args.secret)
    .update(args.rawBody)
    .digest('hex');
  return safeEqual(provided.toLowerCase(), computed.toLowerCase());
}

type BtcPayWebhookEvent = {
  type?: string;
  invoiceId?: string;
  storeId?: string;
  // BTCPay can include additional fields; we only need basics.
};

type BtcPayInvoice = {
  id?: string;
  storeId?: string;
  amount?: number;
  currency?: string;
  status?: string;
  metadata?: Record<string, unknown>;
  buyer?: {
    email?: string;
    name?: string;
  };
};

// Safe config status endpoint (no secrets).
export async function GET() {
  const webhookSecret = Boolean(getEnv('BTCPAY_WEBHOOK_SECRET'));
  const btcpayConfigured = Boolean(getEnv('BTCPAY_URL')) && Boolean(getEnv('BTCPAY_API_KEY')) && Boolean(getEnv('BTCPAY_STORE_ID'));
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
        btcpay: btcpayConfigured,
        btcpayWebhookSecret: webhookSecret,
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
  const secret = getEnv('BTCPAY_WEBHOOK_SECRET');
  const signature = req.headers.get('btcpay-sig') ?? req.headers.get('BTCPay-Sig');

  const raw = Buffer.from(await req.arrayBuffer());
  if (secret) {
    if (!signature) {
      return NextResponse.json({ ok: false, error: 'Missing BTCPay-Sig header.' }, { status: 400 });
    }
    if (!verifyBtcPaySignature({ rawBody: raw, signatureHeader: signature, secret })) {
      return NextResponse.json({ ok: false, error: 'Invalid signature.' }, { status: 400 });
    }
  }

  let payload: BtcPayWebhookEvent | null = null;
  try {
    payload = JSON.parse(raw.toString('utf8')) as BtcPayWebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const eventType = String(payload?.type ?? '').trim();
  const invoiceId = String(payload?.invoiceId ?? '').trim();
  const storeIdFromEvent = String(payload?.storeId ?? '').trim();

  if (!invoiceId) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  // Idempotency: store invoiceId+type as unique key.
  let db: Awaited<ReturnType<typeof getMongoDb>> | null = null;
  try {
    db = await getMongoDb();
    const key = `${invoiceId}:${eventType || 'unknown'}`;
    await db.collection<{ _id: string; receivedAt: Date; invoiceId: string; type: string }>('btcpayWebhookEvents').insertOne({
      _id: key,
      receivedAt: new Date(),
      invoiceId,
      type: eventType || 'unknown',
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code?: unknown }).code === 11000) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }
    console.error('[btcpay-webhook] mongo insert failed', err);
    db = null;
  }

  // Only act on "invoice settled/paid" style events.
  // BTCPay event names vary by version; we gate on a few common ones and also verify invoice status below.
  const likelyPaidEvent =
    eventType.toLowerCase().includes('settled') ||
    eventType.toLowerCase().includes('confirmed') ||
    eventType.toLowerCase().includes('paid') ||
    eventType.toLowerCase().includes('completed');

  if (!likelyPaidEvent && eventType) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
  }

  const BTCPAY_URL = getEnv('BTCPAY_URL');
  const BTCPAY_API_KEY = getEnv('BTCPAY_API_KEY');
  const BTCPAY_STORE_ID = getEnv('BTCPAY_STORE_ID');
  const storeId = storeIdFromEvent || BTCPAY_STORE_ID || '';

  if (!BTCPAY_URL || !BTCPAY_API_KEY || !storeId) {
    // Still acknowledge webhook; we may be missing config in this environment.
    return NextResponse.json({ ok: true, warning: 'BTCPay not configured.' }, { status: 200 });
  }

  try {
    const invoiceUrl = new URL(
      `/api/v1/stores/${encodeURIComponent(storeId)}/invoices/${encodeURIComponent(invoiceId)}`,
      BTCPAY_URL.endsWith('/') ? BTCPAY_URL : `${BTCPAY_URL}/`,
    );

    const res = await fetch(invoiceUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: `token ${BTCPAY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[btcpay-webhook] invoice fetch failed', res.status, text.slice(0, 500));
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const invoice = (await res.json()) as BtcPayInvoice;
    const status = String(invoice.status ?? '').toLowerCase();
    const currency = String(invoice.currency ?? 'usd').toLowerCase();
    const amount = typeof invoice.amount === 'number' ? invoice.amount : null;

    // BTCPay status semantics: treat "settled" or "complete" as paid.
    const isPaid = status === 'settled' || status === 'complete' || status === 'paid' || status === 'confirmed';
    if (!isPaid) {
      return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
    }

    // Try to get donor email from buyer.email or metadata fields.
    const buyerEmailFromBuyer =
      invoice.buyer && typeof invoice.buyer.email === 'string' ? invoice.buyer.email.trim() : '';
    const buyerEmailFromMetaRaw =
      invoice.metadata && typeof invoice.metadata.buyerEmail === 'string'
        ? String(invoice.metadata.buyerEmail).trim()
        : '';
    const customerEmail = (buyerEmailFromBuyer || buyerEmailFromMetaRaw) || null;
    const customerName =
      invoice.buyer && typeof invoice.buyer.name === 'string' ? invoice.buyer.name.trim() : null;

    // Store donation record (best-effort).
    if (db) {
      await db
        .collection<{
          btcpayInvoiceId: string;
          createdAt: Date;
          updatedAt: Date;
          storeId: string;
          status: string;
          amount: number | null;
          currency: string;
          customerEmail: string | null;
          customerName: string | null;
          metadata: Record<string, unknown>;
        }>('btcpayDonations')
        .updateOne(
          { btcpayInvoiceId: invoiceId },
          {
            $setOnInsert: {
              btcpayInvoiceId: invoiceId,
              createdAt: new Date(),
            },
            $set: {
              updatedAt: new Date(),
              storeId,
              status,
              amount,
              currency,
              customerEmail,
              customerName,
              metadata: invoice.metadata ?? {},
            },
          },
          { upsert: true },
        );
    }

    // Thank-you emails: only possible if we have an email on the invoice.
    const thresholdUsd = asNumber(getEnv('DONATION_THANKYOU_THRESHOLD_USD') ?? '50') ?? 50;
    const qualifies = currency === 'usd' && typeof amount === 'number' && amount >= thresholdUsd;

    if (qualifies && customerEmail) {
      const amountMinor = Math.round(amount * 100);
      const amountText = formatMoney(amountMinor, currency);

      const subject = `Thank you for your donation to Bitcoin for the Arts (${amountText})`;
      const text = [
        'Thank you for supporting Bitcoin for the Arts.',
        '',
        `Donation: ${amountText}`,
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
          <p style="margin: 16px 0 0; color: #666; font-size: 12px;">
            Sent from <a href="https://bitcoinforthearts.org">bitcoinforthearts.org</a>
          </p>
        </div>
      `.trim();

      const fromEmail =
        getEnv('DONATIONS_FROM_EMAIL') ?? getEnv('RESEND_FROM_EMAIL') ?? undefined;
      const replyTo = getEnv('DONATIONS_REPLY_TO') ?? 'donate@bitcoinforthearts.org';

      const send = await sendResendEmail({
        to: customerEmail,
        subject,
        text,
        html,
        fromEmail,
        replyTo,
      });

      if (!send.ok && !send.skipped) {
        console.error('[btcpay-webhook] thank-you email failed', send);
      }
    }
  } catch (err) {
    console.error('[btcpay-webhook] handler error', err);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

