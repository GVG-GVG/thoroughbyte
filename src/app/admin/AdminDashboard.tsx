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
  proUsers: number;
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
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'pro'>('all');
  const [saving, setSaving] = useState(false);
  const [editPlan, setEditPlan] = useState('');
  const [editCredits, setEditCredits] = useState(0);
  const [editRole, setEditRole] = useState('');
  const [message, setMessage] = useState('');

  const handleSignOut = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const openUserDetail = (user: UserProfile) => {
    setSelectedUser(user);
    setEditPlan(user.plan);
    setEditCredits(user.credits_remaining);
    setEditRole(user.role || 'other');
    setMessage('');
    setView('user-detail');
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
              <span className="logo-light">Thorough</span>
              <span className="logo-bold">Byte</span>
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
                  <div className="stat-label">Free Accounts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{stats.proUsers}</div>
                  <div className="stat-label">Pro Accounts</div>
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
                  onChange={(e) => setFilterPlan(e.target.value as 'all' | 'free' | 'pro')}
                  className="admin-select"
                >
                  <option value="all">All Plans</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
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
                      <td>{u.plan === 'pro' ? '\u221E' : u.credits_remaining}</td>
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
                      <option value="pro">Pro</option>
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
                    <span className="detail-stat-val">{5 - selectedUser.credits_remaining + selectedUser.cards_generated > 5 ? selectedUser.cards_generated : 5 - selectedUser.credits_remaining}</span>
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
