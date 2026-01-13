import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { isValidBitcoinOnchainAddress } from '@/lib/bitcoinAddress';
import { sendResendEmail } from '@/lib/resend';
import nodemailer from 'nodemailer';

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

function isAllowedOrigin(req: NextRequest) {
  const origin = req.headers.get('origin') ?? '';
  const referer = req.headers.get('referer') ?? '';
  const host = req.headers.get('host') ?? '';

  const allowLocal =
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1') ||
    referer.startsWith('http://localhost') ||
    referer.startsWith('http://127.0.0.1');
  if (allowLocal) return true;

  const primary = 'https://bitcoinforthearts.org';
  const primaryWww = 'https://www.bitcoinforthearts.org';
  const fromHost = host ? `https://${host}` : null;
  const allowed = [primary, primaryWww, fromHost].filter(Boolean) as string[];
  if (!origin && !referer) return true;
  return allowed.some((a) => origin.startsWith(a) || referer.startsWith(a));
}

// Best-effort in-memory rate limit (resets per server instance).
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
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

function requireString(obj: Record<string, unknown>, key: string, label: string) {
  const v = String(obj[key] ?? '').trim();
  if (!v) throw new Error(`Missing required field: ${label}.`);
  return v;
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

async function sendNotificationEmail(args: {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  fromEmail?: string;
}) {
  const resendAttempt = await sendResendEmail({
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
    replyTo: args.replyTo,
    fromEmail: args.fromEmail,
  });
  if (resendAttempt.ok) return { ok: true as const, provider: 'resend' as const };

  const smtpUser =
    getEnv('GOVERNANCE_SMTP_USER') ??
    getEnv('GRANTS_SMTP_USER') ??
    getEnv('CONTACT_SMTP_USER');
  const smtpPass =
    getEnv('GOVERNANCE_SMTP_PASS') ??
    getEnv('GRANTS_SMTP_PASS') ??
    getEnv('CONTACT_SMTP_PASS');
  const smtpHost =
    getEnv('GOVERNANCE_SMTP_HOST') ??
    getEnv('GRANTS_SMTP_HOST') ??
    getEnv('CONTACT_SMTP_HOST') ??
    'smtp.zoho.com';
  const smtpPort = Number(
    getEnv('GOVERNANCE_SMTP_PORT') ??
      getEnv('GRANTS_SMTP_PORT') ??
      getEnv('CONTACT_SMTP_PORT') ??
      '465',
  );
  const smtpSecure =
    (getEnv('GOVERNANCE_SMTP_SECURE') ??
      getEnv('GRANTS_SMTP_SECURE') ??
      getEnv('CONTACT_SMTP_SECURE') ??
      'true').toLowerCase() !== 'false';

  const fromEmail =
    args.fromEmail ??
    getEnv('GOVERNANCE_FROM_EMAIL') ??
    getEnv('GRANTS_FROM_EMAIL') ??
    getEnv('CONTACT_FROM_EMAIL') ??
    getEnv('RESEND_FROM_EMAIL');

  if (!smtpUser || !smtpPass || !fromEmail) {
    return { ok: false as const, skipped: true as const, error: 'Email not configured.' };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: { user: smtpUser, pass: smtpPass },
  });

  await transporter.sendMail({
    from: fromEmail,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
    replyTo: args.replyTo,
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

  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'Invalid origin.' }, { status: 403 });
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

  try {
    const nominatorName = requireString(body, 'nominatorName', 'Your name').slice(0, 200);
    const nominatorEmail = requireString(body, 'nominatorEmail', 'Your email').slice(0, 300);
    if (!isEmail(nominatorEmail)) throw new Error('Your email looks invalid.');
    const nominatorRelationship = String(body.nominatorRelationship ?? '').trim().slice(0, 200) || null;

    const nomineeName = requireString(body, 'nomineeName', 'Nominee name').slice(0, 200);
    const nomineeEmail = requireString(body, 'nomineeEmail', 'Nominee email').slice(0, 300);
    if (!isEmail(nomineeEmail)) throw new Error('Nominee email looks invalid.');

    const nomineeBio = requireString(body, 'nomineeBio', 'Nominee bio/background').trim().slice(0, 5000);
    const nomineeFit = requireString(body, 'nomineeFit', 'Why this nominee fits').trim().slice(0, 5000);

    const nomineeWallet = String(body.nomineeWallet ?? '').trim().slice(0, 200) || null;
    if (nomineeWallet && !isValidBitcoinOnchainAddress(nomineeWallet)) {
      throw new Error('Nominee BTC address looks invalid. Please use an on-chain address (bc1…, 1…, or 3…).');
    }

    const additionalComments = String(body.additionalComments ?? '').trim().slice(0, 5000) || null;

    const now = new Date();
    const db = await getMongoDb();
    const insertRes = await db.collection('boardNominations').insertOne({
      createdAt: now,
      nominator: { name: nominatorName, email: nominatorEmail, relationship: nominatorRelationship },
      nominee: { name: nomineeName, email: nomineeEmail, bio: nomineeBio, fit: nomineeFit, wallet: nomineeWallet },
      additionalComments,
      meta: {
        ip,
        userAgent: req.headers.get('user-agent') ?? null,
      },
    });

    const to =
      getEnv('GOVERNANCE_TO_EMAIL') ??
      getEnv('BOARD_NOMINATION_TO_EMAIL') ??
      getEnv('CONTACT_TO_EMAIL') ??
      'hello@bitcoinforthearts.org';
    const fromEmail =
      getEnv('GOVERNANCE_FROM_EMAIL') ??
      getEnv('RESEND_FROM_EMAIL') ??
      getEnv('CONTACT_FROM_EMAIL') ??
      getEnv('GRANTS_FROM_EMAIL');

    const subject = `Board nomination: ${nomineeName}`.slice(0, 200);
    const text = [
      'New board nomination submitted via bitcoinforthearts.org',
      '',
      `Nomination ID: ${insertRes.insertedId.toString()}`,
      '',
      `Nominator: ${nominatorName} <${nominatorEmail}>`,
      nominatorRelationship ? `Relationship: ${nominatorRelationship}` : 'Relationship: (not provided)',
      '',
      `Nominee: ${nomineeName} <${nomineeEmail}>`,
      nomineeWallet ? `Nominee BTC: ${nomineeWallet}` : 'Nominee BTC: (not provided)',
      '',
      'Nominee bio/background:',
      nomineeBio,
      '',
      'Why nominee fits:',
      nomineeFit,
      '',
      additionalComments ? `Additional comments:\n${additionalComments}` : 'Additional comments: (none)',
      '',
      `IP: ${ip}`,
    ].join('\n');

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">New board nomination</h2>
        <p style="margin: 0 0 6px;"><strong>Nomination ID:</strong> ${escapeHtml(insertRes.insertedId.toString())}</p>
        <p style="margin: 0 0 6px;"><strong>Nominator:</strong> ${escapeHtml(
          nominatorName,
        )} &lt;${escapeHtml(nominatorEmail)}&gt;</p>
        <p style="margin: 0 0 12px;"><strong>Relationship:</strong> ${escapeHtml(
          nominatorRelationship ?? '(not provided)',
        )}</p>
        <p style="margin: 0 0 6px;"><strong>Nominee:</strong> ${escapeHtml(nomineeName)} &lt;${escapeHtml(
          nomineeEmail,
        )}&gt;</p>
        <p style="margin: 0 0 12px;"><strong>Nominee BTC:</strong> ${escapeHtml(
          nomineeWallet ?? '(not provided)',
        )}</p>
        <h3 style="margin: 16px 0 8px;">Nominee bio / background</h3>
        <pre style="white-space: pre-wrap; background: #f6f6f6; padding: 12px; border-radius: 8px;">${escapeHtml(
          nomineeBio,
        )}</pre>
        <h3 style="margin: 16px 0 8px;">Why nominee fits</h3>
        <pre style="white-space: pre-wrap; background: #f6f6f6; padding: 12px; border-radius: 8px;">${escapeHtml(
          nomineeFit,
        )}</pre>
        <h3 style="margin: 16px 0 8px;">Additional comments</h3>
        <pre style="white-space: pre-wrap; background: #f6f6f6; padding: 12px; border-radius: 8px;">${escapeHtml(
          additionalComments ?? '(none)',
        )}</pre>
        <p style="margin: 16px 0 0; color: #666; font-size: 12px;">IP: ${escapeHtml(ip)}</p>
      </div>
    `.trim();

    let emailNotification:
      | { ok: true; provider: 'resend' | 'smtp' }
      | { ok: false; skipped?: boolean; error?: string } = { ok: false };
    try {
      emailNotification = await sendNotificationEmail({
        to,
        subject,
        text,
        html,
        replyTo: nominatorEmail,
        fromEmail,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown email error';
      emailNotification = { ok: false, skipped: false, error: msg };
    }

    await db.collection('boardNominations').updateOne(
      { _id: insertRes.insertedId },
      { $set: { emailNotification, updatedAt: new Date() } },
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Invalid submission.' },
      { status: 400 },
    );
  }
}

// Safe config endpoint (no secrets).
export async function GET() {
  const to =
    getEnv('GOVERNANCE_TO_EMAIL') ??
    getEnv('BOARD_NOMINATION_TO_EMAIL') ??
    getEnv('CONTACT_TO_EMAIL') ??
    'hello@bitcoinforthearts.org';

  const resendApiKey = getEnv('RESEND_API_KEY');
  const fromEmail =
    getEnv('GOVERNANCE_FROM_EMAIL') ??
    getEnv('RESEND_FROM_EMAIL') ??
    getEnv('CONTACT_FROM_EMAIL') ??
    getEnv('GRANTS_FROM_EMAIL');

  let mongoOk = false;
  try {
    await getMongoDb();
    mongoOk = true;
  } catch {
    mongoOk = false;
  }

  const turnstileSecret = getEnv('TURNSTILE_SECRET_KEY');
  const turnstileSiteKey = getEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY');

  return NextResponse.json(
    {
      ok: true,
      configured: {
        mongo: mongoOk,
        email: Boolean(resendApiKey) && Boolean(fromEmail),
        turnstile: Boolean(turnstileSecret) && Boolean(turnstileSiteKey),
      },
      email: {
        to,
        from: fromEmail ?? null,
      },
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}

