import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { formatFrom, sendResendEmail } from '@/lib/resend';
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

function maskEmail(value: string) {
  const at = value.indexOf('@');
  if (at <= 1) return '***';
  return `${value.slice(0, 2)}***${value.slice(at)}`;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function sendBillingEmail(args: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const replyTo = 'donate@bitcoinforthearts.org';

  // Prefer Resend.
  const resendAttempt = await sendResendEmail({
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
    replyTo,
    fromEmail: getEnv('DONATIONS_FROM_EMAIL') ?? getEnv('RESEND_FROM_EMAIL'),
  });
  if (resendAttempt.ok) {
    return { ok: true as const, provider: 'resend' as const, id: resendAttempt.id ?? null };
  }

  // Fallback: SMTP (Zoho/etc). Prefer DONATIONS_*, then CONTACT_*, then GRANTS_* (since many deployments already have it).
  const smtpUser =
    getEnv('DONATIONS_SMTP_USER') ?? getEnv('CONTACT_SMTP_USER') ?? getEnv('GRANTS_SMTP_USER');
  const smtpPass =
    getEnv('DONATIONS_SMTP_PASS') ?? getEnv('CONTACT_SMTP_PASS') ?? getEnv('GRANTS_SMTP_PASS');
  const smtpHost =
    getEnv('DONATIONS_SMTP_HOST') ??
    getEnv('CONTACT_SMTP_HOST') ??
    getEnv('GRANTS_SMTP_HOST') ??
    'smtp.zoho.com';
  const smtpPort = Number(
    getEnv('DONATIONS_SMTP_PORT') ?? getEnv('CONTACT_SMTP_PORT') ?? getEnv('GRANTS_SMTP_PORT') ?? '465',
  );
  const smtpSecure =
    (getEnv('DONATIONS_SMTP_SECURE') ??
      getEnv('CONTACT_SMTP_SECURE') ??
      getEnv('GRANTS_SMTP_SECURE') ??
      'true').toLowerCase() !== 'false';

  const fromEmail =
    getEnv('DONATIONS_FROM_EMAIL') ??
    getEnv('CONTACT_FROM_EMAIL') ??
    getEnv('GRANTS_FROM_EMAIL') ??
    getEnv('RESEND_FROM_EMAIL');

  if (!smtpUser || !smtpPass || !fromEmail) {
    return {
      ok: false as const,
      provider: 'none' as const,
      error:
        resendAttempt.skipped
          ? resendAttempt.reason
          : `${resendAttempt.reason}${'error' in resendAttempt && resendAttempt.error ? ` — ${resendAttempt.error}` : ''}`,
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: formatFrom(fromEmail),
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
    replyTo,
  });

  return { ok: true as const, provider: 'smtp' as const, id: null };
}

// Best-effort in-memory rate limit (resets per server instance).
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 6;
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

async function verifyTurnstile(args: { secret: string; token: string; ip: string }) {
  const body = new URLSearchParams();
  body.set('secret', args.secret);
  body.set('response', args.token);
  if (args.ip && args.ip !== 'unknown') body.set('remoteip', args.ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await res.json().catch(() => null)) as
    | { success: boolean; 'error-codes'?: string[]; hostname?: string }
    | null;
  if (!res.ok || !data) return { ok: false as const, errorCodes: ['turnstile_fetch_failed'] };
  return {
    ok: Boolean(data.success),
    errorCodes: Array.isArray(data['error-codes']) ? data['error-codes'].slice(0, 10) : [],
    hostname: typeof data.hostname === 'string' ? data.hostname : null,
  };
}

function getBaseUrl(req: NextRequest) {
  // Respect Vercel/proxy headers.
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

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimitOk(ip)) {
      return NextResponse.json(
        { ok: false, error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ ok: false, error: 'Invalid JSON.' }, { status: 400 });
    }

    // Honeypot
    if (String(body.company ?? '').trim()) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const email = String(body.email ?? '').trim().toLowerCase();
    if (!email || !isEmail(email)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid email address.' },
        { status: 400 },
      );
    }

    const turnstileSecret = getEnv('TURNSTILE_SECRET_KEY');
    const turnstileSiteKey = getEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY');
    if (turnstileSecret && turnstileSiteKey) {
      const token = String(body['cf-turnstile-response'] ?? '').trim();
      if (!token) {
        return NextResponse.json(
          { ok: false, error: 'Please complete the anti-spam verification and try again.' },
          { status: 400 },
        );
      }
      const t = await verifyTurnstile({ secret: turnstileSecret, token, ip });
      if (!t.ok) {
        return NextResponse.json(
          { ok: false, error: 'Anti-spam verification failed. Please reload and try again.' },
          { status: 403 },
        );
      }
    }

    const stripeKey = getEnv('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      // Don't reveal internal config; provide a user-safe message.
      return NextResponse.json(
        {
          ok: false,
          error:
            'Subscription self-service is not configured yet. Please email donate@bitcoinforthearts.org for help.',
        },
        { status: 503 },
      );
    }
    // Accept standard secret keys (sk_...) and restricted keys (rk_...).
    // Stripe UI often encourages creating restricted keys; those can work as long as they have
    // permissions for customers/subscriptions and billing portal.
    if (!stripeKey.startsWith('sk_') && !stripeKey.startsWith('rk_')) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Subscription self-service is misconfigured. Please contact donate@bitcoinforthearts.org for help.',
        },
        { status: 503 },
      );
    }

    const stripe = new Stripe(stripeKey);

    // Find customer(s) by email.
    const customers = await stripe.customers.list({ email, limit: 10 });
    const customer = customers.data[0] ?? null;

    // Prepare a one-time token link (generated on demand on click) to avoid emailing
    // a short-lived Stripe portal session URL.
    let tokenLink: string | null = null;
    if (customer) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 10,
      });
      const hasManageable = subs.data.some((s) =>
        ['active', 'trialing', 'past_due', 'unpaid'].includes(s.status),
      );
      if (hasManageable) {
        const baseUrl = getBaseUrl(req);
        const token = crypto.randomBytes(24).toString('base64url');
        const now = new Date();
        const ttlHours = Number(getEnv('BILLING_PORTAL_TOKEN_TTL_HOURS') ?? '24');
        const expiresAt = new Date(now.getTime() + (Number.isFinite(ttlHours) ? ttlHours : 24) * 60 * 60 * 1000);

        // Store token in Mongo (required).
        const db = await getMongoDb();
        await db.collection<BillingPortalTokenDoc>('billingPortalTokens').insertOne({
          token,
          email,
          customerId: customer.id,
          createdAt: now,
          expiresAt,
          usedAt: null,
          usedIp: null,
        });

        tokenLink = `${baseUrl}/billing/portal?token=${encodeURIComponent(token)}`;
      }
    }

    // Always send an email so the user gets feedback even if we can't find a subscription,
    // without leaking account existence via the HTTP response.
    const subject = tokenLink
      ? 'Manage your Bitcoin for the Arts subscription'
      : 'Bitcoin for the Arts — billing support';

    const text = tokenLink
      ? [
          'Bitcoin for the Arts — Subscription management',
          '',
          'Use this secure link to open the Stripe customer portal (update payment method, view invoices, or cancel):',
          tokenLink,
          '',
          'For security, this link expires.',
          'If you did not request this link, you can ignore this email.',
          '',
          'Bitcoin for the Arts',
          'https://bitcoinforthearts.org',
        ].join('\n')
      : [
          'Bitcoin for the Arts — Billing support',
          '',
          'We received a request to manage a subscription using this email address.',
          'We were not able to automatically generate a Stripe customer portal link.',
          '',
          'Next steps:',
          '- If you have an active monthly donation, email donate@bitcoinforthearts.org and we will help you from our Stripe dashboard.',
          '- If you received a Stripe receipt/invoice email, it may include billing details and support links.',
          '',
          'If you did not request this email, you can ignore it.',
          '',
          'Bitcoin for the Arts',
          'https://bitcoinforthearts.org',
        ].join('\n');

    const html = tokenLink
      ? `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">Manage your subscription</h2>
          <p style="margin: 0 0 12px;">
            Use this secure link to open the Stripe customer portal (update payment method, view invoices, or cancel):
          </p>
          <p style="margin: 0 0 16px;">
            <a href="${escapeHtml(tokenLink)}" target="_blank" rel="noopener noreferrer">
              Open subscription management
            </a>
          </p>
          <p style="margin: 0; color: #666; font-size: 12px;">
            For security, this link expires.
          </p>
          <p style="margin: 8px 0 0; color: #666; font-size: 12px;">
            If you did not request this link, you can ignore this email.
          </p>
        </div>
      `.trim()
      : `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">Billing support</h2>
          <p style="margin: 0 0 12px;">
            We received a request to manage a subscription using this email address.
            We were not able to automatically generate a Stripe customer portal link.
          </p>
          <p style="margin: 0 0 12px;"><strong>Next steps</strong></p>
          <ul style="margin: 0 0 0 18px; padding: 0;">
            <li>
              If you have an active monthly donation, email
              <a href="mailto:donate@bitcoinforthearts.org">donate@bitcoinforthearts.org</a>
              and we will help you from our Stripe dashboard.
            </li>
            <li>
              If you received a Stripe receipt/invoice email, it may include billing details and support links.
            </li>
          </ul>
          <p style="margin: 12px 0 0; color: #666; font-size: 12px;">
            If you did not request this email, you can ignore it.
          </p>
        </div>
      `.trim();

    const sendAttempt = await sendBillingEmail({ to: email, subject, text, html });
    if (!sendAttempt.ok) {
      console.error('[stripe-portal] billing email failed', sendAttempt);
      return NextResponse.json(
        {
          ok: false,
          error:
            'We could not email you right now. Please try again in a minute or email donate@bitcoinforthearts.org.',
        },
        { status: 502 },
      );
    }

    console.log('[stripe-portal] emailed billing message', {
      to: maskEmail(email),
      hasPortalUrl: Boolean(tokenLink),
      provider: sendAttempt.provider,
      id: sendAttempt.id ?? null,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    // Make sure the client always gets JSON (not a generic HTML 500).
    console.error('[stripe-portal] unhandled error', err);
    return NextResponse.json(
      {
        ok: false,
        error:
          'Subscription self-service is temporarily unavailable. Please email donate@bitcoinforthearts.org for help.',
      },
      { status: 500 },
    );
  }
}

