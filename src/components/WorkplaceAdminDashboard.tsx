'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Users, Activity, Zap, RefreshCw, Copy, Check, FileSearch } from 'lucide-react';

interface Workplace {
  id: string;
  name: string;
  plan: string;
  max_users: number;
  invite_code: string;
}

interface Member {
  id: string;
  clerk_user_id: string | null;
  email: string;
  display_name: string | null;
  role: 'admin' | 'member';
  is_active: boolean;
  invited_at: string;
  joined_at: string | null;
  simplifications_used: number;
  rewrites_used: number;
  last_active: string | null;
}

interface Stats {
  totalMembers: number;
  licencesUsed: number;
  licencesTotal: number;
  activeThisWeek: number;
  totalSimplifications: number;
  totalRewrites: number;
}

interface DecoderStats {
  totalDecoded: number;
  topDocumentTypes: { type: string; count: number }[];
}

interface DashboardData {
  workplace: Workplace;
  members: Member[];
  stats: Stats;
  decoderStats: DecoderStats;
}

const PLAN_LABELS: Record<string, string> = {
  workplace_starter: 'Starter',
  workplace_business: 'Business',
  workplace_enterprise: 'Enterprise',
};

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRelative(iso: string | null) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(iso);
}

export function WorkplaceAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/workplace/dashboard');
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as any).error ?? 'Failed to load dashboard');
        return;
      }
      setData(await res.json());
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      const res = await fetch('/api/workplace/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase() }),
      });
      const j = await res.json();
      if (!res.ok) { setInviteError(j.error ?? 'Failed to add user'); return; }
      setInviteEmail('');
      setInviteSuccess(j.activated
        ? `${inviteEmail} has been added and their Pro access is now active.`
        : `Invite recorded for ${inviteEmail}. They will get access when they sign up.`
      );
      await load();
    } catch {
      setInviteError('Network error');
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(memberId: string, email: string) {
    if (!confirm(`Remove ${email} from the workspace? This will revoke their Pro access.`)) return;
    setRemovingId(memberId);
    try {
      const res = await fetch(`/api/workplace/members/${memberId}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert((j as any).error ?? 'Failed to remove member');
        return;
      }
      await load();
    } finally {
      setRemovingId(null);
    }
  }

  function copyInviteCode(code: string) {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#6b7280' }}>
        <RefreshCw size={20} style={{ marginRight: 8, animation: 'spin 1s linear infinite' }} />
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: '#dc2626', marginBottom: 16 }}>{error}</div>
        <button onClick={load} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff' }}>
          Try again
        </button>
      </div>
    );
  }

  if (!data) return null;

  const { workplace, members, stats, decoderStats } = data;
  const activeMembers = members.filter(m => m.is_active);
  const licencePct = Math.round((stats.licencesUsed / stats.licencesTotal) * 100);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px', fontFamily: "'Lexend', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>{workplace.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 12, background: '#EEF2FF', color: '#3730A3', padding: '2px 10px', borderRadius: 20, fontWeight: 500 }}>
              {PLAN_LABELS[workplace.plan] ?? workplace.plan} plan
            </span>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {stats.licencesUsed} / {stats.licencesTotal} licences used
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Invite code:</span>
          <code style={{ fontSize: 14, fontWeight: 700, color: '#374151', background: '#F3F4F6', padding: '4px 10px', borderRadius: 6 }}>
            {workplace.invite_code}
          </code>
          <button
            onClick={() => copyInviteCode(workplace.invite_code)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}
            title="Copy invite code"
          >
            {codeCopied ? <Check size={16} style={{ color: '#10b981' }} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Active licences" value={`${stats.licencesUsed} / ${stats.licencesTotal}`} sub={`${licencePct}% used`} color="#185FA5" />
        <StatCard label="Active this week" value={stats.activeThisWeek} sub="unique users" color="#0F6E56" />
        <StatCard label="Simplifications" value={stats.totalSimplifications.toLocaleString()} sub="all time" color="#534AB7" />
        <StatCard label="Rewrites" value={stats.totalRewrites.toLocaleString()} sub="all time" color="#D85A30" />
        <StatCard label="Documents decoded" value={decoderStats?.totalDecoded ?? 0} sub="this month" color="#0891b2" />
      </div>

      {/* Licence bar */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 20px', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', marginBottom: 8 }}>
          <span style={{ fontWeight: 500 }}>Licence usage</span>
          <span style={{ color: '#6b7280' }}>{stats.licencesUsed} of {stats.licencesTotal} seats filled</span>
        </div>
        <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${licencePct}%`, background: licencePct >= 90 ? '#dc2626' : licencePct >= 70 ? '#f59e0b' : '#10b981', borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
        {licencePct >= 90 && (
          <div style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>
            Nearly full — contact us to upgrade your plan.
          </div>
        )}
      </div>

      {/* Add user */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <UserPlus size={18} style={{ color: '#185FA5' }} />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Add team member</h2>
        </div>
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            type="email"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
            style={{
              flex: 1, minWidth: 240, padding: '10px 14px', borderRadius: 8,
              border: '1px solid #d1d5db', fontSize: 14, outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={inviting || !inviteEmail.trim()}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none', background: '#185FA5',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: inviting ? 'not-allowed' : 'pointer',
              opacity: inviting ? 0.7 : 1,
            }}
          >
            {inviting ? 'Adding…' : 'Add user'}
          </button>
        </form>
        {inviteError && <div style={{ marginTop: 10, fontSize: 13, color: '#dc2626' }}>{inviteError}</div>}
        {inviteSuccess && <div style={{ marginTop: 10, fontSize: 13, color: '#059669' }}>{inviteSuccess}</div>}
        <p style={{ marginTop: 10, fontSize: 12, color: '#9ca3af', margin: '8px 0 0' }}>
          If the user already has an account, Pro access is granted immediately. Otherwise, it activates when they sign up.
        </p>
      </div>

      {/* Document Decoder insights */}
      {decoderStats && decoderStats.topDocumentTypes.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <FileSearch size={18} style={{ color: '#0891b2' }} />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>Document Decoder — this month</h2>
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
            Employees decoded <strong>{decoderStats.totalDecoded}</strong> document{decoderStats.totalDecoded !== 1 ? 's' : ''} this month.
            The types below are causing the most confusion — consider rewriting them in plain English.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {decoderStats.topDocumentTypes.map(({ type, count }, i) => {
              const pct = Math.round((count / decoderStats.totalDecoded) * 100);
              const barColors = ['#0891b2', '#185FA5', '#534AB7', '#0F6E56', '#D85A30'];
              return (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{type}</span>
                    <span style={{ color: '#6b7280' }}>{count} decode{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColors[i % barColors.length], borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Members table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} style={{ color: '#374151' }} />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111827', margin: 0 }}>
            Team members <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 14 }}>({activeMembers.length})</span>
          </h2>
        </div>

        {activeMembers.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
            No members yet. Add your first team member above.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['User', 'Status', 'Joined', 'Last active', 'Simplifications', 'Rewrites', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeMembers.map((member, i) => (
                  <tr key={member.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : undefined }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, color: '#111827' }}>
                        {member.display_name || member.email.split('@')[0]}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{member.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {member.clerk_user_id ? (
                        <span style={{ fontSize: 12, background: '#F0FDF4', color: '#166534', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                          Active
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>
                          Invite pending
                        </span>
                      )}
                      {member.role === 'admin' && (
                        <span style={{ fontSize: 11, background: '#EEF2FF', color: '#3730A3', padding: '2px 6px', borderRadius: 20, fontWeight: 500, marginLeft: 4 }}>
                          Admin
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151', whiteSpace: 'nowrap' }}>
                      {formatDate(member.joined_at ?? member.invited_at)}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {member.last_active && (
                          <Activity size={12} style={{ color: '#10b981' }} />
                        )}
                        {formatRelative(member.last_active)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Zap size={12} style={{ color: '#534AB7' }} />
                        {member.simplifications_used.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#374151', textAlign: 'center' }}>
                      {member.rewrites_used.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => handleRemove(member.id, member.email)}
                          disabled={removingId === member.id}
                          title="Remove user"
                          style={{
                            background: 'none', border: '1px solid #fee2e2', borderRadius: 6,
                            padding: '4px 8px', cursor: 'pointer', color: '#dc2626',
                            opacity: removingId === member.id ? 0.5 : 1,
                            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
                          }}
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24 }}>
        Need more licences or help? Email <a href="mailto:Dyslexiawrite@gmail.com" style={{ color: '#185FA5' }}>Dyslexiawrite@gmail.com</a>
      </p>
    </div>
  );
}
