'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import '../auth.css';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <a href="/">
              <span className="logo-light">Thorough</span>
              <span className="logo-bold">Byte</span>
            </a>
          </div>
          <h1 className="auth-title">Check your email</h1>
          <div className="auth-success" style={{ marginTop: '16px' }}>
            If an account exists for <strong>{email}</strong>, we sent a password reset link.
          </div>
          <div className="auth-footer" style={{ marginTop: '24px' }}>
            <a href="/auth/signin">Back to sign in</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <a href="/">
            <span className="logo-light">Thorough</span>
            <span className="logo-bold">Byte</span>
          </a>
        </div>

        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">Enter your email and we&apos;ll send a reset link</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          Remember your password?{' '}
          <a href="/auth/signin">Sign in</a>
        </div>
      </div>
    </div>
  );
}
