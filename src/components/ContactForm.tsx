'use client';

import { FormEvent, useState } from 'react';

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      role: (form.elements.namedItem('role') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Submit failed');
      setIsSubmitted(true);
    } catch {
      setError('Something went wrong. Email us directly at info@thoroughbyte.com');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          name="name"
          placeholder="Name"
          required
          disabled={isSubmitted}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          disabled={isSubmitted}
        />
      </div>
      <div className="form-row">
        <select name="role" disabled={isSubmitted} defaultValue="">
          <option value="" disabled>I am a...</option>
          <option value="agent">Bloodstock Agent</option>
          <option value="trainer">Trainer</option>
          <option value="owner">Owner / Syndicate</option>
          <option value="farm">Farm / Consigner</option>
          <option value="other">Other</option>
        </select>
      </div>
      <textarea
        name="message"
        placeholder="Tell us about your operation (optional)"
        rows={3}
        disabled={isSubmitted}
      ></textarea>
      {error && <p style={{ color: '#d85555', fontSize: '14px', margin: '0 0 12px' }}>{error}</p>}
      <button
        type="submit"
        className="btn btn-primary btn-full"
        disabled={isSubmitted || isSubmitting}
      >
        {isSubmitted ? "Submitted — We'll be in touch" : isSubmitting ? 'Submitting...' : 'Request Access'}
      </button>
    </form>
  );
}
