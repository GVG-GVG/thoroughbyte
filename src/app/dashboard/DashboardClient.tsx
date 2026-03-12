'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  plan: string;
  credits_remaining: number;
}

interface GeneratedProfile {
  id: string;
  hip: number;
  sale_id: string;
  card_data: Record<string, unknown>;
  card_image_url: string | null;
  created_at: string;
}

interface SearchResult {
  hip: number;
  sire: string;
  dam: string;
  sex: string;
  state: string;
  consigner: string;
  tier: string;
  rating: number;
  rank: number;
  totalRanked: number;
  time: number;
  stride: number;
  eighth: number;
  quarter: number;
  decel: number;
  dist: string;
  saleStatus: string;
  salePrice: number;
  pctl: { time: number; stride: number; eighth: number; quarter: number; decel: number; rating: number };
}

interface Props {
  user: User;
  profile: Profile | null;
  generatedProfiles: GeneratedProfile[];
}

export default function DashboardClient({ user, profile, generatedProfiles: initialProfiles }: Props) {
  const [hipSearch, setHipSearch] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedProfiles, setGeneratedProfiles] = useState(initialProfiles);
  const [credits, setCredits] = useState(profile?.credits_remaining ?? 0);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const plan = profile?.plan ?? 'free';
  const name = profile?.full_name || user.email?.split('@')[0] || 'there';

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);
    setSearching(true);

    try {
      const res = await fetch(`/api/search?hip=${encodeURIComponent(hipSearch)}`);
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || 'Search failed');
        return;
      }

      setSearchResult(data.horse);
    } catch {
      setSearchError('Network error. Please try again.');
    } finally {
      setSearching(false);
    }
  }, [hipSearch]);

  const handleGenerate = useCallback(async () => {
    if (!searchResult) return;
    setGenerating(true);

    try {
      const res = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hip: searchResult.hip }),
      });
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || 'Card generation failed');
        return;
      }

      // Update credits (consumed one unless it was already generated or pro plan)
      if (!data.already_generated && plan === 'free') {
        setCredits(prev => Math.max(0, prev - 1));
      }

      // Refresh the generated profiles list
      const supabase = createClient();
      const { data: profiles } = await supabase
        .from('generated_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (profiles) setGeneratedProfiles(profiles);

      // Show the generated card
      setSelectedCard(data.card_image_url);
      setSearchResult(null);
      setHipSearch('');
    } catch {
      setSearchError('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [searchResult, user.id]);

  const tierColor = (tier: string): string => {
    const map: Record<string, string> = {
      'ELITE': '#2d6a4f', 'STRONG': '#5a9e68', 'ABOVE AVG': '#3a8abf',
      'AVERAGE': '#b0a030', 'BELOW AVG': '#c07840', 'WEAK': '#c04040'
    };
    return map[tier] || '#888';
  };

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-inner">
          <a href="/" className="logo">
            <span className="logo-light">Thorough</span>
            <span className="logo-bold">Byte</span>
          </a>
          <div className="dash-user">
            <span className="dash-user-email">{user.email}</span>
            <button className="dash-signout" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="dash-content">
        <div className="dash-welcome">
          <h1>Welcome back, {name}</h1>
          <p>Generate horse profile cards from OBS March 2026 breeze data.</p>
        </div>

        {/* Credits */}
        <div className="credits-card">
          <div className="credits-info">
            <h2>{plan === 'free' ? 'Free Plan' : 'Pro Plan'}</h2>
            <p>
              {plan === 'pro'
                ? 'Unlimited profile card generation.'
                : credits > 0
                  ? `You have ${credits} profile card${credits === 1 ? '' : 's'} remaining.`
                  : 'You\'ve used all your free profile cards.'
              }
            </p>
          </div>
          <div className="credits-count">
            <span className="credits-num">{plan === 'pro' ? 'â' : credits}</span>
            <span className="credits-label">{plan === 'free' ? 'of 5' : ''}</span>
          </div>
        </div>

        {/* Upgrade banner */}
        {credits === 0 && plan === 'free' && (
          <div className="upgrade-banner">
            <div>
              <h3>Unlock unlimited profile cards</h3>
              <p>Upgrade to Pro for full access to all 638 horses at OBS March 2026.</p>
            </div>
            <button className="upgrade-btn">Upgrade to Pro</button>
          </div>
        )}

        {/* Hip search */}
        {(credits > 0 || plan === 'pro') && (
          <div className="search-section">
            <h2>Generate a Profile Card</h2>
            <form onSubmit={handleSearch}>
              <div className="search-row">
                <input
                  type="number"
                  className="search-input"
                  placeholder="Enter hip number (e.g. 315)"
                  value={hipSearch}
                  onChange={(e) => setHipSearch(e.target.value)}
                  min={1}
                  max={999}
                  required
                />
                <button type="submit" className="search-btn" disabled={!hipSearch || searching}>
                  {searching ? 'Searching...' : 'Look Up'}
                </button>
              </div>
            </form>

            {searchError && <div className="search-error">{searchError}</div>}

            {/* Search result preview */}
            {searchResult && (
              <div className="search-preview">
                <div className="preview-header">
                  <div>
                    <div className="preview-hip">Hip {searchResult.hip}</div>
                    <div className="preview-name">{searchResult.sire} &mdash; {searchResult.dam}</div>
                    <div className="preview-meta">
                      {searchResult.sex === 'C' ? 'Colt' : 'Filly'} &bull; {searchResult.state}-bred &bull; {searchResult.consigner}
                    </div>
                  </div>
                  <div className="preview-rating">
                    <div className="preview-rating-num">{searchResult.rating}</div>
                    <div className="preview-tier" style={{ color: tierColor(searchResult.tier) }}>
                      {searchResult.tier}
                    </div>
                  </div>
                </div>
                <div className="preview-stats">
                  <div className="preview-stat">
                    <span className="preview-stat-val">{searchResult.time}s</span>
                    <span className="preview-stat-lbl">Time</span>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-stat-val">{searchResult.stride}&apos;</span>
                    <span className="preview-stat-lbl">Stride</span>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-stat-val">#{searchResult.rank}</span>
                    <span className="preview-stat-lbl">Rank</span>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-stat-val">{searchResult.dist} mi</span>
                    <span className="preview-stat-lbl">Distance</span>
                  </div>
                </div>
                <button
                  className="generate-btn"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? 'Generating Card...' : plan === 'pro' ? 'Generate Profile Card' : 'Generate Profile Card (uses 1 credit)'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Full-size card viewer */}
        {selectedCard && (
          <div className="card-viewer">
            <div className="card-viewer-header">
              <h2>Generated Profile Card</h2>
              <div className="card-viewer-actions">
                <a href={selectedCard} download className="card-download-btn">Download PNG</a>
                <button className="card-close-btn" onClick={() => setSelectedCard(null)}>Close</button>
              </div>
            </div>
            <div className="card-viewer-img-wrap">
              <img src={selectedCard} alt="Profile Card" className="card-viewer-img" />
            </div>
          </div>
        )}

        {/* Previously generated profiles */}
        <div className="profiles-section">
          <h2>Your Profile Cards</h2>
          {generatedProfiles.length === 0 ? (
            <div className="empty-state">
              <p>No profile cards generated yet.</p>
              <p className="empty-hint">Search for a hip number above to generate your first card.</p>
            </div>
          ) : (
            <div className="profiles-grid">
              {generatedProfiles.map((gp) => (
                <div
                  key={gp.id}
                  className="profile-thumb"
                  onClick={() => gp.card_image_url && setSelectedCard(gp.card_image_url)}
                  style={{ cursor: gp.card_image_url ? 'pointer' : 'default' }}
                >
                  {gp.card_image_url && (
                    <img
                      className="profile-thumb-img"
                      src={gp.card_image_url}
                      alt={`Hip ${gp.hip} profile card`}
                    />
                  )}
                  <div className="profile-thumb-info">
                    <div className="profile-thumb-hip">Hip {gp.hip}</div>
                    <div className="profile-thumb-name">
                      {(gp.card_data as { sire?: string; dam?: string })?.sire || ''} &mdash;{' '}
                      {(gp.card_data as { sire?: string; dam?: string })?.dam || ''}
                    </div>
                    <div className="profile-thumb-date">
                      {new Date(gp.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
