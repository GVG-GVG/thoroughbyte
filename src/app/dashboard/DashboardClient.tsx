'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import RankedList from '@/components/RankedList';
import ConsignerTable from '@/components/ConsignerTable';

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

interface Props {
  user: User;
  profile: Profile | null;
  generatedProfiles: GeneratedProfile[];
}

type Tab = 'horses' | 'consigners' | 'cards';

export default function DashboardClient({ user, profile, generatedProfiles: initialProfiles }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('horses');
  const [hipSearch, setHipSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [generatedProfiles, setGeneratedProfiles] = useState(initialProfiles);
  const [credits, setCredits] = useState(profile?.credits_remaining ?? 0);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const plan = profile?.plan ?? 'free';
  const name = profile?.full_name || user.email?.split('@')[0] || 'there';

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setSearchError(data.error || 'Failed to start checkout');
      }
    } catch {
      setSearchError('Failed to connect to payment provider.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setSearchError('Failed to open billing portal.');
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const generateCard = useCallback(async (hip: number) => {
    setSearchError('');
    setGenerating(true);
    setGeneratingStatus('Generating horse card...');

    try {
      const genRes = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hip }),
      });
      const genData = await genRes.json();

      if (!genRes.ok) {
        setSearchError(genData.error || 'Card generation failed');
        return;
      }

      // Update credits (consumed one unless it was already generated or pro plan)
      if (!genData.already_generated && plan === 'free') {
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

      // Show the generated card and switch to cards tab
      setSelectedCard(genData.card_image_url);
      setHipSearch('');
    } catch {
      setSearchError('Something went wrong. Please try again.');
    } finally {
      setGenerating(false);
      setGeneratingStatus('');
    }
  }, [user.id, plan]);

  const handleLookup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setGenerating(true);
    setGeneratingStatus('Looking up hip...');

    try {
      const searchRes = await fetch(`/api/search?hip=${encodeURIComponent(hipSearch)}`);
      const searchData = await searchRes.json();

      if (!searchRes.ok) {
        setSearchError(searchData.error || 'Hip not found');
        setGenerating(false);
        setGeneratingStatus('');
        return;
      }

      await generateCard(searchData.horse.hip);
    } catch {
      setSearchError('Something went wrong. Please try again.');
      setGenerating(false);
      setGeneratingStatus('');
    }
  }, [hipSearch, generateCard]);

  const hasAccess = credits > 0 || plan === 'pro';

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
          <p>OBS March 2026 breeze analytics.</p>
        </div>

        {/* Credits */}
        <div className="credits-card">
          <div className="credits-info">
            <h2>{plan === 'free' ? 'Free Plan' : 'Pro Plan'}</h2>
            <p>
              {plan === 'pro'
                ? 'Unlimited horse card generation.'
                : credits > 0
                  ? `You have ${credits} horse card${credits === 1 ? '' : 's'} remaining.`
                  : 'You\'ve used all your free horse cards.'
              }
            </p>
            {plan === 'pro' && (
              <button className="manage-sub-btn" onClick={handleManageSubscription}>
                Manage Subscription
              </button>
            )}
          </div>
          <div className="credits-count">
            <span className="credits-num">{plan === 'pro' ? '\u221E' : credits}</span>
            <span className="credits-label">{plan === 'free' ? 'of 5' : ''}</span>
          </div>
        </div>

        {/* Upgrade banner */}
        {credits === 0 && plan === 'free' && (
          <div className="upgrade-banner">
            <div>
              <h3>Unlock unlimited horse cards</h3>
              <p>Upgrade to Pro for full access to all 638 horses at OBS March 2026.</p>
            </div>
            <button className="upgrade-btn" onClick={handleUpgrade} disabled={upgrading}>
              {upgrading ? 'Redirecting...' : 'Upgrade to Pro'}
            </button>
          </div>
        )}

        {/* Tab navigation */}
        {hasAccess && (
          <div className="dash-tabs">
            <button
              className={`dash-tab${activeTab === 'horses' ? ' dash-tab-active' : ''}`}
              onClick={() => setActiveTab('horses')}
            >
              Horse Ratings
            </button>
            <button
              className={`dash-tab${activeTab === 'consigners' ? ' dash-tab-active' : ''}`}
              onClick={() => setActiveTab('consigners')}
            >
              Consigner Ratings
            </button>
            <button
              className={`dash-tab${activeTab === 'cards' ? ' dash-tab-active' : ''}`}
              onClick={() => setActiveTab('cards')}
            >
              My Horse Cards
              {generatedProfiles.length > 0 && (
                <span className="dash-tab-badge">{generatedProfiles.length}</span>
              )}
            </button>
          </div>
        )}

        {/* ═══ Horse Ratings Tab ═══ */}
        {hasAccess && activeTab === 'horses' && (
          <>
            <RankedList onSelectHip={(hip) => {
              generateCard(hip);
            }} />

          </>
        )}

        {/* ═══ Consigner Ratings Tab ═══ */}
        {hasAccess && activeTab === 'consigners' && (
          <ConsignerTable />
        )}

        {/* ═══ My Horse Cards Tab ═══ */}
        {hasAccess && activeTab === 'cards' && (
          <>
            {/* Hip search */}
            <div className="search-section">
              <h2>Generate a Horse Card</h2>
              <form onSubmit={handleLookup}>
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
                    disabled={generating}
                  />
                  <button type="submit" className="search-btn" disabled={!hipSearch || generating}>
                    {generating ? generatingStatus : plan === 'pro' ? 'Generate Card' : 'Generate Card (1 credit)'}
                  </button>
                </div>
              </form>

              {searchError && <div className="search-error">{searchError}</div>}
            </div>


            {/* Previously generated profiles */}
            <div className="profiles-section">
              <h2>Your Horse Cards</h2>
              {generatedProfiles.length === 0 ? (
                <div className="empty-state">
                  <p>No horse cards generated yet.</p>
                  <p className="empty-hint">Enter a hip number above or click a horse in the Horse Ratings tab to generate your first card.</p>
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
          </>
        )}
      </div>

      {/* ═══ Card Popup Overlay ═══ */}
      {(selectedCard || generating) && (
        <div className="card-overlay" onClick={() => { if (!generating) setSelectedCard(null); }}>
          <div className="card-overlay-inner" onClick={e => e.stopPropagation()}>
            {generating && !selectedCard ? (
              <div className="card-overlay-loading">
                <div className="card-overlay-spinner" />
                <p>{generatingStatus || 'Generating...'}</p>
              </div>
            ) : selectedCard ? (
              <>
                <div className="card-overlay-actions">
                  <a href={selectedCard} download className="card-download-btn">Download PNG</a>
                  <button className="card-close-btn" onClick={() => setSelectedCard(null)}>&times;</button>
                </div>
                <img src={selectedCard} alt="Profile Card" className="card-overlay-img" />
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
