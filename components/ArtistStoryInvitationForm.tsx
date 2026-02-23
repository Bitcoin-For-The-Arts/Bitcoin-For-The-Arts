'use client';

import Script from 'next/script';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

const MEDIA_OPTIONS = [
  {
    value: 'video_interview',
    label: 'Video interview',
    description: '30-60 minutes via Zoom or similar platform.',
  },
  {
    value: 'audio_interview',
    label: 'Audio interview',
    description: 'Podcast-style conversation, 30-60 minutes.',
  },
  {
    value: 'written_interview',
    label: 'Written interview',
    description: 'Answer a short question set by email or form.',
  },
] as const;

const DISCIPLINE_OPTIONS = [
  'Visual arts',
  'Theater',
  'Dance',
  'Music',
  'Writing',
  'Storytelling',
  'Film',
  'Interdisciplinary',
  'Other',
] as const;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return 'Something went wrong. Please try again.';
}

export default function ArtistStoryInvitationForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [mediaFormats, setMediaFormats] = useState<string[]>([]);
  const [storySummary, setStorySummary] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [preferredContactWindow, setPreferredContactWindow] = useState('');
  const [timezone, setTimezone] = useState('');
  const [publicationConsent, setPublicationConsent] = useState(false);
  const [notes, setNotes] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const canSubmit = useMemo(() => status !== 'submitting', [status]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    if (status !== 'error') return;
    const w = window as unknown as { turnstile?: { reset?: () => void } };
    if (typeof w.turnstile?.reset === 'function') {
      try {
        w.turnstile.reset();
      } catch {
        // ignore
      }
    }
  }, [status]);

  function toggleFormat(value: string) {
    setMediaFormats((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
    if (status !== 'idle') {
      setStatus('idle');
      setMessage('');
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const turnstileToken = String(formData.get('cf-turnstile-response') ?? '').trim();

    const missing: string[] = [];
    if (name.trim().length < 2) missing.push('name');
    if (!isEmail(email)) missing.push('valid email');
    if (!discipline.trim()) missing.push('artistic discipline');
    if (mediaFormats.length === 0) missing.push('interview format');
    if (storySummary.trim().length < 10) missing.push('story summary');
    if (!publicationConsent) missing.push('publication consent');

    if (missing.length > 0) {
      setStatus('error');
      setMessage(
        `Please complete: ${missing.join(', ')}.`,
      );
      return;
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus('error');
      setMessage('Please complete the anti-spam verification and try again.');
      return;
    }

    setStatus('submitting');
    setMessage('');

    try {
      const res = await fetch('/api/stories/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          discipline: discipline.trim(),
          mediaFormats,
          storySummary: storySummary.trim(),
          portfolioUrl: portfolioUrl.trim(),
          preferredContactWindow: preferredContactWindow.trim(),
          timezone: timezone.trim(),
          publicationConsent,
          notes: notes.trim(),
          'cf-turnstile-response': turnstileToken,
          website,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error?: string }
        | null;

      if (!res.ok || !data || !('ok' in data) || data.ok !== true) {
        const error =
          data && 'error' in data && typeof data.error === 'string'
            ? data.error
            : `Request failed (HTTP ${res.status}).`;
        throw new Error(error);
      }

      setStatus('success');
      setMessage('Thank you — we will respond within 7-10 business days.');
      setName('');
      setEmail('');
      setDiscipline('');
      setMediaFormats([]);
      setStorySummary('');
      setPortfolioUrl('');
      setPreferredContactWindow('');
      setTimezone('');
      setPublicationConsent(false);
      setNotes('');
      setWebsite('');
      if (TURNSTILE_SITE_KEY) {
        const w = window as unknown as { turnstile?: { reset?: () => void } };
        if (typeof w.turnstile?.reset === 'function') {
          try {
            w.turnstile.reset();
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      setStatus('error');
      setMessage(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {TURNSTILE_SITE_KEY ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      ) : null}

      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block md:col-span-1">
          <div className="text-sm font-semibold">
            Name <span className="text-accent">*</span>
          </div>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Your name"
          />
        </label>

        <label className="block md:col-span-1">
          <div className="text-sm font-semibold">
            Email <span className="text-accent">*</span>
          </div>
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-semibold">
          Artistic discipline <span className="text-accent">*</span>
        </div>
        <select
          name="discipline"
          value={discipline}
          onChange={(e) => setDiscipline(e.target.value)}
          required
          className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">Select your discipline</option>
          {DISCIPLINE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="rounded-2xl border border-border bg-background p-4">
        <legend className="px-1 text-sm font-semibold">
          Preferred interview format <span className="text-accent">*</span>
        </legend>
        <p className="mt-1 text-xs text-muted">
          Select one or more formats you are comfortable with.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          {MEDIA_OPTIONS.map((option) => {
            const checked = mediaFormats.includes(option.value);
            return (
              <label
                key={option.value}
                className={[
                  'cursor-pointer rounded-xl border px-3 py-3 text-sm transition-colors',
                  checked
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface hover:bg-background',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleFormat(option.value)}
                />
                <div className="font-semibold">{option.label}</div>
                <div className="mt-1 text-xs text-muted">{option.description}</div>
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <div className="text-sm font-semibold">
          Briefly share your Bitcoin journey and artistic evolution{' '}
          <span className="text-accent">*</span>
        </div>
        <textarea
          name="storySummary"
          value={storySummary}
          onChange={(e) => setStorySummary(e.target.value)}
          rows={5}
          required
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="How did you discover Bitcoin? What breakthroughs or challenges shaped your journey? How does it influence your creative work?"
        />
      </label>

      <label className="block">
        <div className="text-sm font-semibold">Portfolio or social link (optional)</div>
        <input
          name="portfolioUrl"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="https://..."
        />
      </label>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <div className="text-sm font-semibold">
            Preferred contact window (optional)
          </div>
          <input
            name="preferredContactWindow"
            value={preferredContactWindow}
            onChange={(e) => setPreferredContactWindow(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Weekdays after 2pm ET, mornings, evenings, etc."
          />
        </label>

        <label className="block">
          <div className="text-sm font-semibold">Timezone (optional)</div>
          <input
            name="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="ET, PT, UTC+1, etc."
          />
        </label>
      </div>

      <label className="block">
        <div className="text-sm font-semibold">Anything else you want us to know? (optional)</div>
        <textarea
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          placeholder="Availability, timezone, accessibility notes, or other context."
        />
      </label>

      <label className="flex items-start gap-3 rounded-xl border border-border bg-surface/70 p-4 text-sm leading-relaxed text-muted">
        <input
          type="checkbox"
          checked={publicationConsent}
          onChange={(e) => setPublicationConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4"
          required
        />
        <span>
          I consent to potential publication of my submitted story content (edited
          for clarity) on BFTA channels, with final publication confirmed with me
          before release.
        </span>
      </label>

      {TURNSTILE_SITE_KEY ? (
        <div className="flex justify-center">
          <div
            className="cf-turnstile"
            data-sitekey={TURNSTILE_SITE_KEY}
            data-theme="auto"
            data-size="flexible"
            data-action="artist_story_submission"
          />
        </div>
      ) : null}

      {message ? (
        <div
          className={[
            'rounded-xl border p-3 text-sm',
            status === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : 'border-border bg-surface text-muted',
          ].join(' ')}
        >
          {message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={!canSubmit}
        className={[
          'inline-flex min-h-12 w-full items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90',
          status === 'submitting' ? 'cursor-wait opacity-60' : '',
        ].join(' ')}
      >
        {status === 'submitting' ? 'Submitting…' : 'Share my story'}
      </button>
    </form>
  );
}
