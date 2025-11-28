'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left side - Contact info */}
          <div>
            <h1 className="text-5xl font-bold mb-8 uppercase tracking-tight">
              CONTACT US
            </h1>
            <a
              href="mailto:info@bitcoinforthearts.org"
              className="text-blue-600 hover:text-blue-700 text-lg"
            >
              info@bitcoinforthearts.org
            </a>
          </div>

          {/* Right side - Contact form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm text-gray-500 mb-2 uppercase tracking-wide"
                >
                  FIRST NAME
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border-b border-black bg-transparent pb-2 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm text-gray-500 mb-2 uppercase tracking-wide"
                >
                  LAST NAME
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border-b border-black bg-transparent pb-2 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm text-gray-500 mb-2 uppercase tracking-wide"
                >
                  EMAIL
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-b border-black bg-transparent pb-2 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm text-gray-500 mb-2 uppercase tracking-wide"
                >
                  MESSAGE
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full border border-black bg-transparent p-2 focus:outline-none focus:border-blue-600 resize"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md transition-colors uppercase tracking-wide"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
