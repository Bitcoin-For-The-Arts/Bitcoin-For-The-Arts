import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getMongoDb } from '@/lib/mongodb';
import { formatFrom, sendResendEmail } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  email?: string;
  // Honeypot (should stay empty)
  website?: string;
};

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
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Best-effort in-memory rate limit (resets per server instance).
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 15;
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

async function sendNewsletterNotification(args: {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const resend = await sendResendEmail({
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
    replyTo: args.replyTo,
    fromEmail: getEnv('RESEND_FROM_EMAIL') ?? getEnv('CONTACT_FROM_EMAIL'),
  });
  if (resend.ok) return { ok: true as const, provider: 'resend' as const };
  if (!resend.skipped) {
    // If Resend is configured but failed, we can still attempt SMTP fallback below.
    console.error('[newsletter] resend failed', resend);
  }

  const smtpUser = getEnv('CONTACT_SMTP_USER');
  const smtpPass = getEnv('CONTACT_SMTP_PASS');
  const smtpHost = getEnv('CONTACT_SMTP_HOST') ?? 'smtp.zoho.com';
  const smtpPort = Number(getEnv('CONTACT_SMTP_PORT') ?? '587');
  const smtpSecure = getEnv('CONTACT_SMTP_SECURE') === 'true' || smtpPort === 465;
  const fromEmail = getEnv('CONTACT_FROM_EMAIL') ?? getEnv('RESEND_FROM_EMAIL');

  if (!smtpUser || !smtpPass || !fromEmail) {
    return {
      ok: false as const,
      error: 'Email delivery is not configured yet.',
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
    ...(args.html ? { html: args.html } : null),
    ...(args.replyTo ? { replyTo: args.replyTo } : null),
  });

  return { ok: true as const, provider: 'smtp' as const };
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
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: if filled, pretend success.
  if (body.website && String(body.website).trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const email = String(body.email ?? '').trim().toLowerCase();
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  const toEmail = getEnv('NEWSLETTER_TO_EMAIL') ?? 'hello@bitcoinforthearts.org';
  const ua = req.headers.get('user-agent') ?? '';
  const now = new Date();

  // Store (best-effort). If MongoDB isn't configured, skip silently.
  try {
    if (getEnv('MONGODB_URI')) {
      const db = await getMongoDb();
      await db.collection('newsletterSignups').updateOne(
        { email },
        {
          $setOnInsert: {
            email,
            createdAt: now,
          },
          $set: {
            lastSeenAt: now,
            lastIp: ip,
            lastUserAgent: ua,
            source: 'footer',
          },
        },
        { upsert: true },
      );
    }
  } catch (err) {
    console.error('[newsletter] db write failed', err);
  }

  const subject = `Newsletter signup: ${email}`.slice(0, 200);
  const text = [
    'New newsletter signup (bitcoinforthearts.org)',
    '',
    `Email: ${email}`,
    `Time: ${now.toISOString()}`,
    `IP: ${ip}`,
    ua ? `User-Agent: ${ua}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">New newsletter signup</h2>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin: 0 0 8px;"><strong>Time:</strong> ${escapeHtml(now.toISOString())}</p>
      <p style="margin: 0 0 8px;"><strong>IP:</strong> ${escapeHtml(ip)}</p>
      ${
        ua
          ? `<p style="margin: 0 0 0;"><strong>User-Agent:</strong> ${escapeHtml(ua)}</p>`
          : ''
      }
    </div>
  `.trim();

  try {
    const send = await sendNewsletterNotification({
      to: toEmail,
      replyTo: email,
      subject,
      text,
      html,
    });

    if (!send.ok) {
      console.error('[newsletter] email send not ok', send);
      return NextResponse.json(
        { ok: false, error: 'Unable to sign up right now. Please try again later.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('[newsletter] email send failed', err);
    return NextResponse.json(
      { ok: false, error: 'Unable to sign up right now. Please try again later.' },
      { status: 502 },
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

