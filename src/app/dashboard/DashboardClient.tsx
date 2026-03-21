'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import RankedList from '@/components/RankedList';
import ConsignerTable from '@/components/ConsignerTable';
import SirePerformance from '@/components/SirePerformance';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  plan: string;
  credits_remaining: number;
  credit_sale_id?: string;
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

type Tab = 'horses' | 'consigners' | 'sires' | 'cards';
type Plan = 'free' | 'shortlist' | 'pro' | 'elite';

const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  shortlist: 'Short List',
  pro: 'Pro',
  elite: 'Elite',
};

const SALES = [
  { id: 'obs-march-2026', label: 'OBS March 2026', count: 638 },
  { id: 'obs-april-2025', label: 'OBS April 2025', count: 902 },
  { id: 'obs-march-2025', label: 'OBS March 2025', count: 650 },
  { id: 'obs-april-2024', label: 'OBS April 2024', count: 807 },
  { id: 'obs-march-2024', label: 'OBS March 2024', count: 667 },
] as const;

// Access matrix: which tabs are accessible per plan
function canAccess(plan: Plan, tab: Tab): boolean {
  switch (tab) {
    case 'cards': return true; // All plans can see cards tab (credits permitting)
    case 'horses': return plan === 'elite';
    case 'consigners': return plan === 'pro' || plan === 'elite';
    case 'sires': return plan === 'elite';
    default: return false;
  }
}

function getUpgradePlan(tab: Tab): { plan: string; label: string } {
  switch (tab) {
    case 'horses': return { plan: 'elite', label: 'Elite' };
    case 'consigners': return { plan: 'pro', label: 'Pro' };
    case 'sires': return { plan: 'elite', label: 'Elite' };
    default: return { plan: 'elite', label: 'Elite' };
  }
}

// Blurred gate overlay
function GateOverlay({ tab, onUpgrade }: { tab: Tab; onUpgrade: (plan: string) => void }) {
  const { plan, label } = getUpgradePlan(tab);
  const descriptions: Record<string, string> = {
    horses: 'The full ranked list with sorting, filtering, tier badges, and export is available on the Elite plan.',
    consigners: 'Consigner ratings with Bayesian-adjusted racing outcomes are available on Pro and Elite plans.',
    sires: 'Sire performance aggregations across the entire sale are available on the Elite plan.',
  };

  return (
    <div className="gate-overlay">
      <div className="gate-content">
        <div className="gate-lock">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3>Upgrade to {label}</h3>
        <p>{descriptions[tab]}</p>
        <button className="gate-upgrade-btn" onClick={() => onUpgrade(plan)}>
          Upgrade to {label}
        </button>
      </div>
    </div>
  );
}

export default function DashboardClient({ user, profile, generatedProfiles: initialProfiles }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('cards');
  const [selectedSale, setSelectedSale] = useState('obs-march-2026');
  const [hipSearch, setHipSearch] = useState('');
  const [searchError, setSearchError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [generatedProfiles, setGeneratedProfiles] = useState(initialProfiles);
  const [credits, setCredits] = useState(profile?.credits_remaining ?? 0);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const plan = (profile?.plan ?? 'free') as Plan;
  const name = profile?.full_name || user.email?.split('@')[0] || 'there';
  const hasCredits = credits > 0 || plan === 'pro' || plan === 'elite';

  const handleUpgrade = async (targetPlan?: string) => {
    setUpgrading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: targetPlan || 'pro',
          saleId: targetPlan === 'shortlist' ? selectedSale : undefined,
        }),
      });
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

      // Update credits (consumed one unless it was already generated or unlimited plan)
      if (!genData.already_generated && (plan === 'free' || plan === 'shortlist')) {
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

  const creditLabel = () => {
    if (plan === 'elite' || plan === 'pro') return 'Unlimited horse card generation.';
    if (plan === 'shortlist') {
      const saleName = SALES.find(s => s.id === profile?.credit_sale_id)?.label || profile?.credit_sale_id || 'selected sale';
      return credits > 0
        ? `${credits} horse card${credits === 1 ? '' : 's'} remaining for ${saleName}.`
        : `You've used all your Short List cards for ${saleName}.`;
    }
    return credits > 0
      ? `You have ${credits} free horse card${credits === 1 ? '' : 's'} remaining.`
      : 'You\'ve used all your free horse cards.';
  };

  const maxCredits = plan === 'shortlist' ? 25 : 3;

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-inner">
          <a href="/" className="logo">
            <span className="logo-icon">T<span>B</span></span>
            <span><span className="logo-light">Thorough</span><span className="logo-bold">Byte</span></span>
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
        </div>

        {/* Credits / Plan Card */}
        <div className="credits-card">
          <div className="credits-info">
            <h2>{PLAN_LABELS[plan]} Plan</h2>
            <p>{creditLabel()}</p>
            {(plan === 'pro' || plan === 'elite') && (
              <button className="manage-sub-btn" onClick={handleManageSubscription}>
                Manage Subscription
              </button>
            )}
          </div>
          <div className="credits-count">
            <span className="credits-num">{(plan === 'pro' || plan === 'elite') ? '\u221E' : credits}</span>
            <span className="credits-label">{(plan === 'free' || plan === 'shortlist') ? `of ${maxCredits}` : ''}</span>
          </div>
        </div>

        {/* Upgrade banner for free/shortlist users with 0 credits */}
        {!hasCredits && (plan === 'free' || plan === 'shortlist') && (
          <div className="upgrade-banner">
            <div>
              <h3>Need more horse cards?</h3>
              <p>Upgrade your plan for more lookups and access to advanced analytics.</p>
            </div>
            <div className="upgrade-banner-btns">
              {plan === 'free' && (
                <button className="upgrade-btn upgrade-btn-outline" onClick={() => handleUpgrade('shortlist')} disabled={upgrading}>
                  Short List &mdash; $250
                </button>
              )}
              <button className="upgrade-btn" onClick={() => handleUpgrade('pro')} disabled={upgrading}>
                {upgrading ? 'Redirecting...' : 'Go Pro \u2014 $1,000/yr'}
              </button>
            </div>
          </div>
        )}

        {/* Tab navigation — always visible */}
        <div className="dash-tabs">
          <div className="dash-tabs-left">
            <button
              className={`dash-tab${activeTab === 'cards' ? ' dash-tab-active' : ''}`}
              onClick={() => setActiveTab('cards')}
            >
              My Horse Cards
              {generatedProfiles.length > 0 && (
                <span className="dash-tab-badge">{generatedProfiles.length}</span>
              )}
            </button>
            <button
              className={`dash-tab${activeTab === 'horses' ? ' dash-tab-active' : ''}`}
              onClick={() => setActiveTab('horses')}
            >
              Horse Ratings
              {!canAccess(plan, 'horses') && <span className="dash-tab-lock">Elite</span>}
            </button>
            <button
              className={`dash-tab${activeTab === 'consigners' ? ' dash-tab-active' : ''}`}
              onClick={() => setActiveTab('consigners')}
            >
              Consigner Ratings
              {!canAccess(plan, 'consigners') && <span className="dash-tab-lock">Pro</span>}
            </button>
            <button
              className={`dash-tab${activeTab === 'sires' ? ' dash-tab-active' : ''}`}
              onClick={() => setActiveTab('sires')}
            >
              Sire Performance
              {!canAccess(plan, 'sires') && <span className="dash-tab-lock">Elite</span>}
            </button>
          </div>
          {activeTab !== 'consigners' && (
            <select
              className="dash-sale-select"
              value={selectedSale}
              onChange={e => setSelectedSale(e.target.value)}
            >
              {SALES.map(s => (
                <option key={s.id} value={s.id}>{s.label} ({s.count})</option>
              ))}
            </select>
          )}
        </div>

        {/* ═══ My Horse Cards Tab ═══ */}
        {activeTab === 'cards' && (
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
                    disabled={generating || !hasCredits}
                  />
                  <button type="submit" className="search-btn" disabled={!hipSearch || generating || !hasCredits}>
                    {generating
                      ? generatingStatus
                      : (plan === 'pro' || plan === 'elite')
                        ? 'Generate Card'
                        : `Generate Card (1 credit)`
                    }
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
                  <p className="empty-hint">Enter a hip number above to generate your first card.</p>
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

        {/* ═══ Horse Ratings Tab ═══ */}
        {activeTab === 'horses' && (
          <div className="gated-section">
            {canAccess(plan, 'horses') ? (
              <RankedList
                sale={selectedSale}
                saleLabel={SALES.find(s => s.id === selectedSale)?.label ?? 'OBS'}
                onSelectHip={(hip) => generateCard(hip)}
              />
            ) : (
              <div className="gated-blur-wrap">
                <div className="gated-blur-content">
                  <RankedList
                    sale={selectedSale}
                    saleLabel={SALES.find(s => s.id === selectedSale)?.label ?? 'OBS'}
                    onSelectHip={() => {}}
                  />
                </div>
                <GateOverlay tab="horses" onUpgrade={handleUpgrade} />
              </div>
            )}
          </div>
        )}

        {/* ═══ Consigner Ratings Tab ═══ */}
        {activeTab === 'consigners' && (
          <div className="gated-section">
            {canAccess(plan, 'consigners') ? (
              <ConsignerTable />
            ) : (
              <div className="gated-blur-wrap">
                <div className="gated-blur-content">
                  <ConsignerTable />
                </div>
                <GateOverlay tab="consigners" onUpgrade={handleUpgrade} />
              </div>
            )}
          </div>
        )}

        {/* ═══ Sire Performance Tab ═══ */}
        {activeTab === 'sires' && (
          <div className="gated-section">
            {canAccess(plan, 'sires') ? (
              <SirePerformance
                sale={selectedSale}
                saleLabel={SALES.find(s => s.id === selectedSale)?.label ?? 'OBS'}
              />
            ) : (
              <div className="gated-blur-wrap">
                <div className="gated-blur-content">
                  <SirePerformance
                    sale={selectedSale}
                    saleLabel={SALES.find(s => s.id === selectedSale)?.label ?? 'OBS'}
                  />
                </div>
                <GateOverlay tab="sires" onUpgrade={handleUpgrade} />
              </div>
            )}
          </div>
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
