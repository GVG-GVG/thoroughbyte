'use client';

import { FormEvent, useState } from 'react';

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }, 500);
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
        <select name="role" disabled={isSubmitted}>
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
      <button
        type="submit"
        className="btn btn-primary btn-full"
        disabled={isSubmitted || isSubmitting}
      >
        {isSubmitted ? "Submitted — We'll be in touch" : 'Request Access'}
      </button>
    </form>
  );
}
