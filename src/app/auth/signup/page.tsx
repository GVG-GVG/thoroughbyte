'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import '../auth.css';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role || undefined,
        },
      },
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
            We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account and get your 5 free horse profile cards.
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Get 5 free horse profile cards</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              placeholder="John Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="role">I am a... (optional)</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                fontFamily: 'inherit',
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: '6px',
                color: role ? 'var(--white)' : 'rgba(138,155,174,0.6)',
                appearance: 'none' as const,
                cursor: 'pointer',
              }}
            >
              <option value="">Select...</option>
              <option value="agent">Bloodstock Agent</option>
              <option value="trainer">Trainer</option>
              <option value="owner">Owner / Syndicate</option>
              <option value="farm">Farm / Consigner</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <a href="/auth/signin">Sign in</a>
        </div>
      </div>
    </div>
  );
}
