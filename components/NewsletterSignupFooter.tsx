'use client';

import { useMemo, useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

function isEmail(value: string) {
  const v = value.trim();
  if (!v) return false;
  // Pragmatic validation (avoid overly strict rules).
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
  }
  return 'Something went wrong. Please try again.';
}

export default function NewsletterSignupFooter() {
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState(''); // honeypot
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  const canSubmit = useMemo(() => {
    if (status === 'submitting' || status === 'success') return false;
    return isEmail(email) && agreed;
  }, [email, agreed, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim().toLowerCase();
    if (!isEmail(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter-signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: trimmed, website: hp }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error?: string }
        | null;

      if (!res.ok || !data || !('ok' in data) || data.ok !== true) {
        const msg = data && 'error' in data && typeof data.error === 'string' ? data.error : '';
        throw new Error(msg || `Request failed (HTTP ${res.status}).`);
      }

      setStatus('success');
      setMessage('Thank you — we’ll share our first newsletter in April.');
    } catch (err) {
      setStatus('error');
      setMessage(getErrorMessage(err));
    }
  }

  return (
    <section
      aria-label="Newsletter signup"
      className="mb-10 rounded-2xl border border-white/15 bg-white/5 p-5 sm:border-border sm:bg-surface/60"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/80 sm:text-muted">
            Stay informed with news &amp; updates
          </div>
          <div className="mt-2 text-sm leading-relaxed text-white/80 sm:text-muted">
            Get occasional updates on grants, programming, and events. First newsletter planned for April.
          </div>
        </div>

        <form onSubmit={onSubmit} className="w-full sm:max-w-md">
          {/* Honeypot field for bots (should remain empty). */}
          <input
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="hidden"
            aria-hidden="true"
            name="website"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="w-full">
              <span className="sr-only">Email address</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== 'idle') setStatus('idle');
                  setMessage('');
                }}
                placeholder="Email address"
                className="min-h-11 w-full rounded-md border border-white/15 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/25 sm:border-border sm:bg-background sm:text-foreground sm:placeholder:text-muted"
              />
            </label>

            <button
              type="submit"
              disabled={!canSubmit}
              className={[
                'inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2 text-sm font-semibold transition-colors',
                'bg-accent text-black hover:opacity-90',
                !canSubmit ? 'opacity-60 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {status === 'submitting' ? 'Signing up…' : status === 'success' ? 'Signed up' : 'Sign up'}
            </button>
          </div>

          <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-white/70 sm:text-muted">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 shrink-0 accent-accent"
            />
            <span>
              I agree to receive email updates from Bitcoin for the Arts and
              acknowledge the{' '}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                Privacy Policy
              </a>{' '}
              and{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                Terms of Use
              </a>.
            </span>
          </label>

          {message ? (
            <div
              className={[
                'mt-3 rounded-xl border p-3 text-sm',
                status === 'error'
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-white/15 bg-white/5 text-white/80 sm:border-border sm:bg-surface/50 sm:text-muted',
              ].join(' ')}
            >
              {message}
            </div>
          ) : null}
        </form>
      </div>

      <div className="mt-4 text-xs text-white/70 sm:text-muted">
        You can unsubscribe anytime.
      </div>
    </section>
  );
}

