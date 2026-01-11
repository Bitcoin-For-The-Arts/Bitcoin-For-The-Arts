'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

type State =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

export default function FeedbackForm() {
  const [state, setState] = useState<State>({ status: 'idle' });
  const [anonymous, setAnonymous] = useState(false);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    if (state.status !== 'error') return;
    const w = window as unknown as { turnstile?: { reset?: () => void } };
    if (typeof w.turnstile?.reset === 'function') {
      try {
        w.turnstile.reset();
      } catch {
        // ignore
      }
    }
  }, [state.status]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot
    if (String(fd.get('company') ?? '').trim()) {
      setState({ status: 'success' });
      form.reset();
      return;
    }

    if (TURNSTILE_SITE_KEY) {
      const token = String(fd.get('cf-turnstile-response') ?? '').trim();
      if (!token) {
        setState({ status: 'error', message: 'Please complete the anti-spam verification and try again.' });
        return;
      }
    }

    if (anonymous) {
      fd.set('email', '');
      fd.set('allowFollowUp', 'false');
    } else {
      fd.set('allowFollowUp', 'true');
    }

    const payload = Object.fromEntries(fd.entries());

    setState({ status: 'submitting' });
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Submission failed (HTTP ${res.status}).`);
      }
      setState({ status: 'success' });
      form.reset();
      setAnonymous(false);
    } catch (err) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as any).message) : '';
      setState({ status: 'error', message: msg || 'Something went wrong. Please try again.' });
    }
  };

  if (state.status === 'success') {
    return (
      <div className="rounded-2xl border border-border bg-background p-6">
        <div className="font-semibold">Thanks — feedback received.</div>
        <div className="mt-2 text-sm text-muted">
          We review feedback regularly to improve grants, programming, and community support.
        </div>
        <button
          type="button"
          onClick={() => setState({ status: 'idle' })}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-5 py-2 text-sm font-semibold transition-colors hover:opacity-90"
        >
          Submit more feedback
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {TURNSTILE_SITE_KEY ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      ) : null}

      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <div className="text-sm font-semibold">
            Your role with BFTA <span className="text-accent">*</span>
          </div>
          <select
            name="role"
            required
            defaultValue=""
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select…
            </option>
            <option value="artist_grant_applicant">Artist / Grant applicant</option>
            <option value="donor_patron">Donor / Patron</option>
            <option value="workshop_participant">Workshop / Residency participant</option>
            <option value="partner_collaborator">Partner / Collaborator</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="block md:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">Email (optional, for follow-up)</div>
            <label className="inline-flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="h-4 w-4"
              />
              Keep my feedback anonymous
            </label>
          </div>
          <input
            name="email"
            type="email"
            disabled={anonymous}
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-50"
            placeholder="you@example.com"
          />
        </label>

        <fieldset className="md:col-span-2 rounded-2xl border border-border bg-background p-4">
          <legend className="px-1 text-sm font-semibold">
            Overall satisfaction <span className="text-accent">*</span>{' '}
            <span className="text-xs font-normal text-muted">(1 = Poor, 5 = Excellent)</span>
          </legend>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {['1', '2', '3', '4', '5'].map((v) => (
              <label
                key={v}
                className="flex cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:opacity-90"
              >
                <input
                  type="radio"
                  name="satisfaction"
                  value={v}
                  required={v === '1'}
                  className="sr-only"
                />
                {v}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block md:col-span-2">
          <div className="text-sm font-semibold">What do you like most? (optional)</div>
          <textarea
            name="strengths"
            rows={3}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Workshops, grants, transparency, website experience…"
          />
        </label>

        <label className="block md:col-span-2">
          <div className="text-sm font-semibold">Suggestions for improvement (optional)</div>
          <textarea
            name="improvements"
            rows={3}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="More partnerships, clearer guidelines, new education topics, better tools…"
          />
        </label>

        <fieldset className="md:col-span-2 rounded-2xl border border-border bg-background p-4">
          <legend className="px-1 text-sm font-semibold">
            Would you recommend BFTA? <span className="text-accent">*</span>
          </legend>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
              { label: 'Maybe', value: 'maybe' },
            ].map((o) => (
              <label
                key={o.value}
                className="flex cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:opacity-90"
              >
                <input
                  type="radio"
                  name="recommend"
                  value={o.value}
                  required={o.value === 'yes'}
                  className="sr-only"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block md:col-span-2">
          <div className="text-sm font-semibold">Feedback on Bitcoin integration (optional)</div>
          <textarea
            name="bitcoinFeedback"
            rows={3}
            className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Wallet onboarding, on-chain vs Lightning, volatility notes, custody education…"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 text-xs text-muted">
        Responses are confidential and used to enhance our mission. We may share aggregated insights publicly as part of our
        transparency model.
      </div>

      {TURNSTILE_SITE_KEY ? (
        <div className="flex justify-center">
          <div
            className="cf-turnstile"
            data-sitekey={TURNSTILE_SITE_KEY}
            data-theme="auto"
            data-size="flexible"
            data-action="feedback_survey"
          />
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className={[
          'inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90',
          state.status === 'submitting' ? 'opacity-70 cursor-wait' : '',
        ].join(' ')}
      >
        {state.status === 'submitting' ? 'Submitting…' : 'Submit feedback'}
      </button>
    </form>
  );
}

