import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Bitcoin for the Arts.',
};

export default function ContactPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="max-w-md">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Contact
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              Let’s talk.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              For grants, partnerships, programming proposals, or press: email us or
              use the form.
            </p>
            <div className="mt-6">
              <a
                href="mailto:hello@bitcoinforthearts.org"
                className="text-sm font-semibold underline underline-offset-4"
              >
                hello@bitcoinforthearts.org
              </a>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
