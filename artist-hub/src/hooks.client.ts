import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/public';

const dsn = (env as any).PUBLIC_SENTRY_DSN || '';

if (dsn) {
  Sentry.init({
    dsn,
    environment: (env as any).PUBLIC_SENTRY_ENV || 'production',
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
    integrations: [Sentry.browserTracingIntegration()],
    beforeSend(event) {
      if (event.exception?.values?.some((v) => v.type === 'AbortError')) return null;
      if (event.exception?.values?.some((v) => v.value?.includes('WebSocket'))) return null;
      return event;
    },
  });
}

export const handleError = dsn ? Sentry.handleErrorWithSentry() : undefined;
