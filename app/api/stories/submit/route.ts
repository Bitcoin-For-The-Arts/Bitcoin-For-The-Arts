import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { sendResendEmail } from '@/lib/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type StorySubmissionPayload = {
  name?: string;
  email?: string;
  discipline?: string;
  mediaFormats?: unknown;
  storySummary?: string;
  portfolioUrl?: string;
  preferredContactWindow?: string;
  timezone?: string;
  publicationConsent?: unknown;
  'cf-turnstile-response'?: string;
  notes?: string;
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

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 8;
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

function maskEmail(value?: string) {
  if (!value) return undefined;
  const at = value.indexOf('@');
  if (at <= 1) return '***';
  return `${value.slice(0, 2)}***${value.slice(at)}`;
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

function normalizeMediaFormats(input: unknown) {
  if (!Array.isArray(input)) return [];
  const allowed = new Set(['video_interview', 'audio_interview', 'written_interview']);
  return input
    .map((value) => String(value).trim())
    .filter((value) => allowed.has(value))
    .slice(0, 3);
}

function mediaLabel(value: string) {
  switch (value) {
    case 'video_interview':
      return 'Video interview';
    case 'audio_interview':
      return 'Audio interview';
    case 'written_interview':
      return 'Written interview';
    default:
      return value;
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimitOk(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  let payload: StorySubmissionPayload;
  try {
    payload = (await req.json()) as StorySubmissionPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const turnstileSecret = getEnv('TURNSTILE_SECRET_KEY');
  const turnstileSiteKey = getEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY');
  if (turnstileSecret && turnstileSiteKey) {
    const token = String(payload['cf-turnstile-response'] ?? '').trim();
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Please complete the anti-spam verification and try again.' },
        { status: 400 },
      );
    }
    const t = await verifyTurnstile({ secret: turnstileSecret, token, ip });
    if (!t.ok) {
      return NextResponse.json(
        { ok: false, error: 'Anti-spam verification failed. Please refresh and try again.' },
        { status: 403 },
      );
    }
  }

  const name = String(payload.name ?? '').trim().slice(0, 120);
  const email = String(payload.email ?? '').trim().toLowerCase().slice(0, 320);
  const discipline = String(payload.discipline ?? '').trim().slice(0, 80);
  const mediaFormats = normalizeMediaFormats(payload.mediaFormats);
  const storySummary = String(payload.storySummary ?? '').trim().slice(0, 6000);
  const portfolioUrl = String(payload.portfolioUrl ?? '').trim().slice(0, 500);
  const preferredContactWindow = String(payload.preferredContactWindow ?? '')
    .trim()
    .slice(0, 200);
  const timezone = String(payload.timezone ?? '').trim().slice(0, 80);
  const publicationConsent =
    payload.publicationConsent === true ||
    String(payload.publicationConsent ?? '')
      .trim()
      .toLowerCase() === 'true';
  const notes = String(payload.notes ?? '').trim().slice(0, 2000);

  if (!name || !email || !discipline || !storySummary) {
    return NextResponse.json(
      { ok: false, error: 'Please complete all required fields.' },
      { status: 400 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }
  if (mediaFormats.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Please select at least one interview format.' },
      { status: 400 },
    );
  }
  if (!publicationConsent) {
    return NextResponse.json(
      { ok: false, error: 'Publication consent is required to submit your story.' },
      { status: 400 },
    );
  }

  const primaryStoryEmail =
    getEnv('ARTIST_STORIES_TO_EMAIL') ?? 'artist@bitcoinforthearts.org';
  const contactFallback = getEnv('CONTACT_TO_EMAIL');
  const recipients = Array.from(
    new Set([primaryStoryEmail, contactFallback].filter(Boolean) as string[]),
  );
  const fromEmail =
    getEnv('ARTIST_STORIES_FROM_EMAIL') ??
    getEnv('CONTACT_FROM_EMAIL') ??
    getEnv('RESEND_FROM_EMAIL');

  const formatList = mediaFormats.map(mediaLabel).join(', ');
  const subject = `Artist story submission: ${name}`.slice(0, 180);

  const text = [
    'New artist story submission from bitcoinforthearts.org/stories',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Discipline: ${discipline}`,
    `Preferred format(s): ${formatList}`,
    `Publication consent: ${publicationConsent ? 'yes' : 'no'}`,
    portfolioUrl ? `Portfolio / social: ${portfolioUrl}` : 'Portfolio / social: (not provided)',
    preferredContactWindow
      ? `Preferred contact window: ${preferredContactWindow}`
      : 'Preferred contact window: (not provided)',
    timezone ? `Timezone: ${timezone}` : 'Timezone: (not provided)',
    '',
    'Story summary:',
    storySummary,
    '',
    notes ? `Additional notes:\n${notes}` : 'Additional notes: (not provided)',
    '',
    `IP: ${ip}`,
  ].join('\n');

  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">New artist story submission</h2>
      <p style="margin: 0 0 6px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin: 0 0 6px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin: 0 0 6px;"><strong>Discipline:</strong> ${escapeHtml(discipline)}</p>
      <p style="margin: 0 0 12px;"><strong>Preferred format(s):</strong> ${escapeHtml(formatList)}</p>
      <p style="margin: 0 0 6px;"><strong>Publication consent:</strong> ${publicationConsent ? 'yes' : 'no'}</p>
      <p style="margin: 0 0 12px;"><strong>Portfolio / social:</strong> ${escapeHtml(
        portfolioUrl || '(not provided)',
      )}</p>
      <p style="margin: 0 0 6px;"><strong>Preferred contact window:</strong> ${escapeHtml(
        preferredContactWindow || '(not provided)',
      )}</p>
      <p style="margin: 0 0 12px;"><strong>Timezone:</strong> ${escapeHtml(
        timezone || '(not provided)',
      )}</p>
      <p style="margin: 16px 0 8px;"><strong>Story summary:</strong></p>
      <pre style="white-space: pre-wrap; background: #f6f6f6; padding: 12px; border-radius: 8px;">${escapeHtml(
        storySummary,
      )}</pre>
      <p style="margin: 16px 0 8px;"><strong>Additional notes:</strong></p>
      <pre style="white-space: pre-wrap; background: #f6f6f6; padding: 12px; border-radius: 8px;">${escapeHtml(
        notes || '(not provided)',
      )}</pre>
      <p style="margin: 16px 0 0; color: #666; font-size: 12px;">IP: ${escapeHtml(ip)}</p>
    </div>
  `.trim();

  const resendAttempt = await sendResendEmail({
    to: recipients,
    subject,
    text,
    html,
    replyTo: email,
    fromEmail,
  });

  if (resendAttempt.ok) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const smtpUser =
    getEnv('ARTIST_STORIES_SMTP_USER') ?? getEnv('CONTACT_SMTP_USER');
  const smtpPass =
    getEnv('ARTIST_STORIES_SMTP_PASS') ?? getEnv('CONTACT_SMTP_PASS');
  const smtpHost =
    getEnv('ARTIST_STORIES_SMTP_HOST') ??
    getEnv('CONTACT_SMTP_HOST') ??
    'smtp.zoho.com';
  const smtpPort = Number(
    getEnv('ARTIST_STORIES_SMTP_PORT') ?? getEnv('CONTACT_SMTP_PORT') ?? '465',
  );
  const smtpSecure =
    (getEnv('ARTIST_STORIES_SMTP_SECURE') ??
      getEnv('CONTACT_SMTP_SECURE') ??
      'true').toLowerCase() !== 'false';

  if (!smtpUser || !smtpPass || !fromEmail) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'We could not submit your story right now. Please email artist@bitcoinforthearts.org directly.',
      },
      { status: 503 },
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: fromEmail,
      to: recipients,
      subject,
      text,
      html,
      replyTo: email,
    });
  } catch (err) {
    console.error('[stories-submit] smtp failed', err);
    return NextResponse.json(
      {
        ok: false,
        error:
          'We could not submit your story right now. Please email artist@bitcoinforthearts.org directly.',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function GET() {
  const primaryStoryEmail =
    getEnv('ARTIST_STORIES_TO_EMAIL') ?? 'artist@bitcoinforthearts.org';
  const contactFallback = getEnv('CONTACT_TO_EMAIL');
  const recipients = Array.from(
    new Set([primaryStoryEmail, contactFallback].filter(Boolean) as string[]),
  );
  const fromEmail =
    getEnv('ARTIST_STORIES_FROM_EMAIL') ??
    getEnv('CONTACT_FROM_EMAIL') ??
    getEnv('RESEND_FROM_EMAIL');
  const hasResend = Boolean(getEnv('RESEND_API_KEY')) && Boolean(fromEmail);
  const hasSmtp =
    Boolean(getEnv('ARTIST_STORIES_SMTP_USER') ?? getEnv('CONTACT_SMTP_USER')) &&
    Boolean(getEnv('ARTIST_STORIES_SMTP_PASS') ?? getEnv('CONTACT_SMTP_PASS')) &&
    Boolean(fromEmail);
  const hasTurnstile =
    Boolean(getEnv('TURNSTILE_SECRET_KEY')) &&
    Boolean(getEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY'));

  return NextResponse.json(
    {
      ok: true,
      configured: {
        resend: hasResend,
        smtp: hasSmtp,
        turnstile: hasTurnstile,
      },
      email: {
        to: recipients.map((addr) => maskEmail(addr)),
        from: maskEmail(fromEmail),
      },
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
