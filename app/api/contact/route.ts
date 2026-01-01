import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type ContactPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  message?: string;
  // Honeypot (should stay empty)
  company?: string;
};

function getEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function getClientIp(req: NextRequest) {
  // Vercel sets x-forwarded-for as a comma-separated list (client, proxy1, ...)
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') ?? 'unknown';
}

// Basic in-memory rate limit (best-effort; resets per server instance)
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
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

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimitOk(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request.' },
      { status: 400 },
    );
  }

  // Honeypot trap for bots
  if (payload.company && payload.company.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const firstName = (payload.firstName ?? '').trim();
  const lastName = (payload.lastName ?? '').trim();
  const email = (payload.email ?? '').trim();
  const message = (payload.message ?? '').trim();

  if (!email || !message) {
    return NextResponse.json(
      { ok: false, error: 'Please include your email and a message.' },
      { status: 400 },
    );
  }

  const smtpUser = getEnv('CONTACT_SMTP_USER');
  const smtpPass = getEnv('CONTACT_SMTP_PASS');
  const smtpHost = getEnv('CONTACT_SMTP_HOST') ?? 'smtp.zoho.com';
  const smtpPort = Number(getEnv('CONTACT_SMTP_PORT') ?? '465');
  const smtpSecure =
    (getEnv('CONTACT_SMTP_SECURE') ?? 'true').toLowerCase() !== 'false';

  const toEmail = getEnv('CONTACT_TO_EMAIL') ?? 'hello@bitcoinforthearts.org';
  const fromEmail = getEnv('CONTACT_FROM_EMAIL') ?? smtpUser;

  if (!smtpUser || !smtpPass || !fromEmail) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Contact form is not configured yet. Please email hello@bitcoinforthearts.org.',
      },
      { status: 503 },
    );
  }

  const subjectPrefix = getEnv('CONTACT_SUBJECT_PREFIX') ?? 'Website contact';
  const subject = `${subjectPrefix}: ${email}`.slice(0, 200);
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();

  const text = [
    'New message from bitcoinforthearts.org',
    '',
    name ? `Name: ${name}` : 'Name: (not provided)',
    `Email: ${email}`,
    '',
    message,
    '',
    `IP: ${ip}`,
  ].join('\n');

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">New message from bitcoinforthearts.org</h2>
      <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(
        name || '(not provided)',
      )}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(
        email,
      )}</p>
      <p style="margin: 16px 0 8px;"><strong>Message:</strong></p>
      <pre style="white-space: pre-wrap; background: #f6f6f6; padding: 12px; border-radius: 8px;">${escapeHtml(
        message,
      )}</pre>
      <p style="margin: 16px 0 0; color: #666; font-size: 12px;">IP: ${escapeHtml(
        ip,
      )}</p>
    </div>
  `.trim();

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject,
      text,
      html,
      replyTo: email,
    });
  } catch (err) {
    console.error('[contact] failed to send email', err);
    return NextResponse.json(
      {
        ok: false,
        error:
          'Sorry — we could not send your message right now. Please email hello@bitcoinforthearts.org.',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

