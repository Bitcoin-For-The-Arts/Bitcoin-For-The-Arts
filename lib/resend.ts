function getEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function formatFrom(value: string) {
  const trimmed = value.trim();
  if (trimmed.includes('<') && trimmed.includes('>')) return trimmed;
  return `Bitcoin for the Arts <${trimmed}>`;
}

export async function sendResendEmail(args: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  fromEmail?: string;
}) {
  const resendApiKey = getEnv('RESEND_API_KEY');
  if (!resendApiKey) {
    return { ok: false as const, skipped: true as const, reason: 'missing_resend_api_key' };
  }

  const from = args.fromEmail ?? getEnv('RESEND_FROM_EMAIL');
  if (!from) {
    return { ok: false as const, skipped: true as const, reason: 'missing_resend_from_email' };
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: formatFrom(from),
      to: Array.isArray(args.to) ? args.to : [args.to],
      subject: args.subject,
      text: args.text,
      ...(args.html ? { html: args.html } : null),
      ...(args.replyTo ? { reply_to: args.replyTo } : null),
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    return {
      ok: false as const,
      skipped: false as const,
      reason: `resend_http_${res.status}`,
      error: bodyText.slice(0, 2000),
    };
  }

  return { ok: true as const, skipped: false as const };
}

