'use client';

import { useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  plan: string;
  credits_remaining: number;
  created_at: string;
  updated_at: string;
  cards_generated: number;
}

interface Stats {
  totalUsers: number;
  freeUsers: number;
  shortlistUsers: number;
  proUsers: number;
  eliteUsers: number;
  totalCards: number;
  totalCreditsRemaining: number;
  usersWithCards: number;
}

interface AdminAction {
  id: string;
  admin_id: string;
  target_user_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface HorseCard {
  id: string;
  hip: number;
  sale_id: string;
  card_data: Record<string, unknown> | null;
  card_image_url: string | null;
  created_at: string;
}

interface Props {
  stats: Stats;
  users: UserProfile[];
  adminEmail: string;
  recentActions: AdminAction[];
}

export default function AdminDashboard({ stats, users: initialUsers, adminEmail, recentActions }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [view, setView] = useState<'overview' | 'users' | 'user-detail'>('overview');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'cards_generated' | 'credits_remaining'>('created_at');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'shortlist' | 'pro' | 'elite'>('all');
  const [saving, setSaving] = useState(false);
  const [editPlan, setEditPlan] = useState('');
  const [editCredits, setEditCredits] = useState(0);
  const [editRole, setEditRole] = useState('');
  const [message, setMessage] = useState('');
  const [userCards, setUserCards] = useState<HorseCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const openUserDetail = async (user: UserProfile) => {
    setSelectedUser(user);
    setEditPlan(user.plan);
    setEditCredits(user.credits_remaining);
    setEditRole(user.role || 'other');
    setMessage('');
    setUserCards([]);
    setView('user-detail');

    // Fetch user's generated cards
    setLoadingCards(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_cards', user_id: user.id }),
      });
      const data = await res.json();
      if (data.cards) setUserCards(data.cards);
    } catch {
      console.error('Failed to load cards');
    } finally {
      setLoadingCards(false);
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          plan: editPlan,
          credits_remaining: editCredits,
          role: editRole,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
        return;
      }

      const updated = {
        ...selectedUser,
        plan: editPlan,
        credits_remaining: editCredits,
        role: editRole,
      };
      setSelectedUser(updated);
      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
      setMessage('Saved successfully.');
    } catch {
      setMessage('Network error.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = users
    .filter(u => {
      if (filterPlan !== 'all' && u.plan !== filterPlan) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          u.email?.toLowerCase().includes(q) ||
          u.full_name?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'cards_generated') return b.cards_generated - a.cards_generated;
      if (sortBy === 'credits_remaining') return b.credits_remaining - a.credits_remaining;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <a href="/" className="logo">
              <span className="logo-icon">T<span>B</span></span>
              <span><span className="logo-light">Thorough</span><span className="logo-bold">Byte</span></span>
            </a>
            <span className="admin-badge">Admin</span>
          </div>
          <div className="admin-header-right">
            <span className="admin-email">{adminEmail}</span>
            <a href="/dashboard" className="admin-nav-link">Dashboard</a>
            <button className="dash-signout" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      </div>

      <div className="admin-body">
        <nav className="admin-nav">
          <button
            className={`admin-nav-btn ${view === 'overview' ? 'active' : ''}`}
            onClick={() => setView('overview')}
          >
            Overview
          </button>
          <button
            className={`admin-nav-btn ${view === 'users' || view === 'user-detail' ? 'active' : ''}`}
            onClick={() => { setView('users'); setSelectedUser(null); }}
          >
            Users
          </button>
        </nav>

        <main className="admin-main">
          {view === 'overview' && (
            <div>
              <h1 className="admin-title">Overview</h1>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-num">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.freeUsers}</div>
                  <div className="stat-label">Free</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.shortlistUsers}</div>
                  <div className="stat-label">Short List</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.proUsers}</div>
                  <div className="stat-label">Pro</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.eliteUsers}</div>
                  <div className="stat-label">Elite</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.totalCards}</div>
                  <div className="stat-label">Cards Generated</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.usersWithCards}</div>
                  <div className="stat-label">Users with Cards</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.totalCreditsRemaining}</div>
                  <div className="stat-label">Credits Remaining (all)</div>
                </div>
              </div>

              {recentActions.length > 0 && (
                <div className="admin-section">
                  <h2>Recent Admin Actions</h2>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Action</th>
                        <th>Target</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActions.map((a) => (
                        <tr key={a.id}>
                          <td>{new Date(a.created_at).toLocaleString()}</td>
                          <td>{a.action}</td>
                          <td className="mono">{a.target_user_id?.slice(0, 8)}...</td>
                          <td className="mono">{JSON.stringify(a.details?.after || a.details || {})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {view === 'users' && (
            <div>
              <h1 className="admin-title">Users ({filtered.length})</h1>
              <div className="users-controls">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="admin-search"
                />
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value as 'all' | 'free' | 'shortlist' | 'pro' | 'elite')}
                  className="admin-select"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="shortlist">Short List</option>
                  <option value="pro">Pro</option>
                  <option value="elite">Elite</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'created_at' | 'cards_generated' | 'credits_remaining')}
                  className="admin-select"
                >
                  <option value="created_at">Newest First</option>
                  <option value="cards_generated">Most Cards</option>
                  <option value="credits_remaining">Most Credits</option>
                </select>
              </div>

              <table className="admin-table users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Credits</th>
                    <th>Cards</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="user-row"
                      onClick={() => openUserDetail(u)}
                    >
                      <td className="user-name">{u.full_name || '\u2014'}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`plan-badge ${u.plan}`}>
                          {u.plan}
                        </span>
                      </td>
                      <td>{u.plan === 'pro' || u.plan === 'elite' ? '\u221E' : u.credits_remaining}</td>
                      <td>{u.cards_generated}</td>
                      <td>{u.role || '\u2014'}</td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'user-detail' && selectedUser && (
            <div>
              <button className="back-btn" onClick={() => { setView('users'); setSelectedUser(null); }}>
                &larr; Back to Users
              </button>
              <h1 className="admin-title">{selectedUser.full_name || selectedUser.email}</h1>
              <p className="admin-subtitle">{selectedUser.email}</p>
              <p className="admin-subtitle mono">ID: {selectedUser.id}</p>

              <div className="detail-grid">
                <div className="detail-card">
                  <h3>Account Settings</h3>
                  <div className="form-group">
                    <label>Plan</label>
                    <select
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value)}
                      className="admin-select full"
                    >
                      <option value="free">Free</option>
                      <option value="shortlist">Short List</option>
                      <option value="pro">Pro</option>
                      <option value="elite">Elite</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Credits Remaining</label>
                    <input
                      type="number"
                      value={editCredits}
                      onChange={(e) => setEditCredits(parseInt(e.target.value) || 0)}
                      className="admin-input"
                      min={0}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="admin-select full"
                    >
                      <option value="agent">Agent</option>
                      <option value="trainer">Trainer</option>
                      <option value="owner">Owner</option>
                      <option value="farm">Farm</option>
                      <option value="other">Other</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <button
                    className="save-btn"
                    onClick={handleSaveUser}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {message && (
                    <div className={`admin-message ${message.startsWith('Error') ? 'error' : 'success'}`}>
                      {message}
                    </div>
                  )}
                </div>

                <div className="detail-card">
                  <h3>Activity</h3>
                  <div className="detail-stat-row">
                    <span className="detail-stat-label">Cards Generated</span>
                    <span className="detail-stat-val">{selectedUser.cards_generated}</span>
                  </div>
                  <div className="detail-stat-row">
                    <span className="detail-stat-label">Credits Used</span>
                    <span className="detail-stat-val">{selectedUser.cards_generated}</span>
                  </div>
                  <div className="detail-stat-row">
                    <span className="detail-stat-label">Account Created</span>
                    <span className="detail-stat-val">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-stat-row">
                    <span className="detail-stat-label">Last Updated</span>
                    <span className="detail-stat-val">{new Date(selectedUser.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <div className="detail-card">
                  <h3>Generated Horse Cards ({userCards.length})</h3>
                  {loadingCards ? (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading cards...</p>
                  ) : userCards.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No cards generated yet.</p>
                  ) : (
                    <table className="admin-table" style={{ marginTop: 12 }}>
                      <thead>
                        <tr>
                          <th>Hip #</th>
                          <th>Sale</th>
                          <th>Horse Name</th>
                          <th>Score</th>
                          <th>Tier</th>
                          <th>Generated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userCards.map((card) => {
                          const cd = card.card_data as Record<string, unknown> | null;
                          const horseName = (cd?.horse_name as string) || (cd?.name as string) || '\u2014';
                          const score = cd?.score != null ? String(cd.score) : '\u2014';
                          const tier = (cd?.tier as string) || '\u2014';
                          return (
                            <tr key={card.id}>
                              <td style={{ fontWeight: 600 }}>
                                {card.card_image_url ? (
                                  <a
                                    href={card.card_image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#3b82f6', textDecoration: 'none' }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {card.hip}
                                  </a>
                                ) : (
                                  card.hip
                                )}
                              </td>
                              <td>{card.sale_id.replace(/-/g, ' ').toUpperCase()}</td>
                              <td>{horseName}</td>
                              <td>{score}</td>
                              <td>{tier}</td>
                              <td>{new Date(card.created_at).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
