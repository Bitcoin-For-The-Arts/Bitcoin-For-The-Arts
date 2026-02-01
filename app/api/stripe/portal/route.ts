import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendResendEmail } from '@/lib/resend';

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
    if (!stripeKey.startsWith('sk_')) {
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

    // Always return ok to avoid leaking whether the email exists.
    // If we can create a portal session, we email the link.
    if (customer) {
      // Only proceed if there is at least one active/trialing subscription.
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
        const returnUrl = `${baseUrl}/billing`;
        const session = await stripe.billingPortal.sessions.create({
          customer: customer.id,
          return_url: returnUrl,
        });

        const subject = 'Manage your Bitcoin for the Arts subscription';
        const text = [
          'Bitcoin for the Arts — Subscription management',
          '',
          'Use this secure Stripe link to manage your subscription (update payment method, view invoices, or cancel):',
          session.url,
          '',
          'If you did not request this link, you can ignore this email.',
          '',
          'Bitcoin for the Arts',
          'https://bitcoinforthearts.org',
        ].join('\n');

        const html = `
          <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
            <h2 style="margin: 0 0 12px;">Manage your subscription</h2>
            <p style="margin: 0 0 12px;">
              Use this secure Stripe link to manage your subscription (update payment method, view invoices, or cancel):
            </p>
            <p style="margin: 0 0 16px;">
              <a href="${escapeHtml(session.url)}" target="_blank" rel="noopener noreferrer">
                Open Stripe customer portal
              </a>
            </p>
            <p style="margin: 0; color: #666; font-size: 12px;">
              If you did not request this link, you can ignore this email.
            </p>
          </div>
        `.trim();

        const emailAttempt = await sendResendEmail({
          to: email,
          subject,
          text,
          html,
          replyTo: 'donate@bitcoinforthearts.org',
          fromEmail: getEnv('DONATIONS_FROM_EMAIL') ?? getEnv('RESEND_FROM_EMAIL'),
        });
        if (!emailAttempt.ok) {
          console.error('[stripe-portal] resend failed', emailAttempt);
          // Return a message so the UI doesn't show a generic 500.
          return NextResponse.json(
            {
              ok: false,
              error:
                'We could not email the portal link right now. Please try again in a minute or email donate@bitcoinforthearts.org.',
            },
            { status: 502 },
          );
        }
      }
    }

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

