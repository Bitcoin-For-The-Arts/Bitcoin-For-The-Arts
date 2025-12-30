'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('Message from bitcoinforthearts.org');
    const body = encodeURIComponent(
      [
        `Name: ${formData.firstName} ${formData.lastName}`.trim(),
        `Email: ${formData.email}`,
        '',
        formData.message,
      ].join('\n'),
    );

    window.location.href = `mailto:hello@bitcoinforthearts.org?subject=${subject}&body=${body}`;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label
          htmlFor="firstName"
          className="block text-sm text-muted mb-2 uppercase tracking-wide"
        >
          First name
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="w-full border-b border-border bg-transparent pb-2 focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label
          htmlFor="lastName"
          className="block text-sm text-muted mb-2 uppercase tracking-wide"
        >
          Last name
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="w-full border-b border-border bg-transparent pb-2 focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm text-muted mb-2 uppercase tracking-wide"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border-b border-border bg-transparent pb-2 focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm text-muted mb-2 uppercase tracking-wide"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          className="w-full rounded-md border border-border bg-transparent p-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
      >
        Send email
      </button>
    </form>
  );
}

