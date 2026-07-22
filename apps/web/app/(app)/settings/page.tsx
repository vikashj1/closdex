'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRequireAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

// Settings — Vikash dashboard redesign 2026-06-16, wired 2026-06-18.
// Visual port of the new HTML. Data wiring lifted from pre-redesign
// e1fc5ae version: hooks/state/API calls on real endpoints, JSX preserved
// from the new prototype.

type Tab = 'Profile' | 'Security';

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'CONNECTIONS_ONLY', label: 'Unlisted' },
  { value: 'PRIVATE', label: 'Private' },
] as const;

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('SALESPERSON');
  const { refresh, logout } = useAuth();

  const [tab, setTab] = useState<Tab>('Profile');

  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'CONNECTIONS_ONLY' | 'PRIVATE'>('PUBLIC');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [preferredLocations, setPreferredLocations] = useState('');
  const [openToWork, setOpenToWork] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setLocation(user.location ?? '');
    const sp = user.salesperson;
    if (sp) {
      setResumeUrl(sp.resumeUrl ?? '');
      setOpenToWork(sp.openToWork ?? false);
      setVisibility((sp.visibility as 'PUBLIC' | 'CONNECTIONS_ONLY' | 'PRIVATE') ?? 'PUBLIC');
      setSalaryExpectation(sp.salaryExpectation != null ? String(sp.salaryExpectation) : '');
      setPreferredLocations((sp.preferredLocations ?? []).join(', '));
    }
  }, [user]);

  async function saveProfile() {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await api.users.updateMe({ name, location: location || undefined });
      await api.users.updateSalesperson({
        resumeUrl: resumeUrl || undefined,
        openToWork,
        visibility,
        salaryExpectation: salaryExpectation ? parseInt(salaryExpectation, 10) : undefined,
        preferredLocations: preferredLocations
          ? preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      });
      void refresh();
      setProfileMsg({ ok: true, text: 'Profile updated.' });
    } catch (e) {
      setProfileMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Failed to save.' });
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword() {
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ ok: false, text: 'New password must be at least 8 characters.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await api.users.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwMsg({ ok: true, text: 'Password changed successfully.' });
    } catch (e) {
      setPwMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Failed to change password.' });
    } finally {
      setPwSaving(false);
    }
  }

  function handleSignOut() {
    logout('/login');
  }

  // Inline style atoms reused across both tabs.
  const inputStyle: React.CSSProperties = {
    height: '44px',
    padding: '0 14px',
    border: '1px solid #E7E7EC',
    borderRadius: '10px',
    background: '#fff',
    fontFamily: 'Inter,sans-serif',
    fontSize: '14px',
    color: '#0B0B0F',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };
  const readOnlyInputStyle: React.CSSProperties = {
    ...inputStyle,
    background: '#F4F4F7',
    color: '#7A7A86',
    cursor: 'not-allowed',
  };
  const labelStyle: React.CSSProperties = { fontSize: '13.5px', fontWeight: 600, color: '#0B0B0F' };
  const fieldColStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '9px' };
  const tabLinkStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 2px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    color: active ? '#0B0B0F' : '#7A7A86',
    boxShadow: active ? 'inset 0 -2px 0 #0B0B0F' : 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  });
  const primaryBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    height: '44px',
    padding: '0 22px',
    border: 'none',
    borderRadius: '10px',
    background: '#0B0B0F',
    color: '#fff',
    fontFamily: 'Inter,sans-serif',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  };
  const ghostBtnStyle: React.CSSProperties = {
    ...primaryBtnStyle,
    background: '#fff',
    color: '#0B0B0F',
    border: '1px solid #E7E7EC',
  };

  function renderMsg(msg: { ok: boolean; text: string } | null) {
    if (!msg) return null;
    return (
      <div
        style={{
          padding: '10px 14px',
          borderRadius: '10px',
          background: msg.ok ? '#ECFDF3' : '#FEF2F2',
          color: msg.ok ? '#067647' : '#B42318',
          fontSize: '13px',
          fontFamily: 'Inter,sans-serif',
        }}
      >
        {msg.text}
      </div>
    );
  }

  if (authLoading || !user) {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '34px 40px 72px' }}>
        <div style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', color: '#7A7A86' }}>
          Loading your settings…
        </div>
      </div>
    );
  }

  return (
    <div data-resp="settings">
      <div className="r-page settings-page" style={{ maxWidth: '760px', margin: '0 auto', padding: '34px 40px 72px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '0 0 22px',
          }}
        >
          <h1
            className="r-title"
            style={{
              margin: 0,
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              fontSize: '33px',
              letterSpacing: '-0.03em',
              color: '#0B0B0F',
            }}
          >
            Settings
          </h1>
          <button onClick={handleSignOut} style={ghostBtnStyle}>
            Sign out
          </button>
        </div>

        <div className="r-hscroll" style={{ borderBottom: '1px solid #E7E7EC', marginBottom: '36px' }}>
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '26px',
            }}
          >
            <button onClick={() => setTab('Profile')} style={tabLinkStyle(tab === 'Profile')}>
              Profile
            </button>
            <button onClick={() => setTab('Security')} style={tabLinkStyle(tab === 'Security')}>
              Security
            </button>
          </nav>
        </div>

        {tab === 'Profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div data-r="cols1-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px' }}>
              <div style={fieldColStyle}>
                <label style={labelStyle}>Display name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  style={inputStyle}
                />
              </div>
              <div style={fieldColStyle}>
                <label style={labelStyle}>Email</label>
                <input value={email} readOnly style={readOnlyInputStyle} />
              </div>
            </div>

            <div data-r="cols1-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px' }}>
              <div style={fieldColStyle}>
                <label style={labelStyle}>Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Bengaluru, India"
                  style={inputStyle}
                />
              </div>
              <div style={fieldColStyle}>
                <label style={labelStyle}>Expected CTC (₹ LPA)</label>
                <input
                  value={salaryExpectation}
                  onChange={(e) => setSalaryExpectation(e.target.value)}
                  placeholder="18"
                  type="number"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={fieldColStyle}>
              <label style={labelStyle}>Resume URL</label>
              <input
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="Link to your resume or portfolio"
                style={inputStyle}
              />
            </div>

            <div data-r="cols1-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px' }}>
              <div style={fieldColStyle}>
                <label style={labelStyle}>Profile visibility</label>
                <span style={{ fontSize: '12px', color: '#9A9AA4', marginTop: '-5px' }}>
                  Who can see your public profile
                </span>
                <div style={{ position: 'relative' }}>
                  <select
                    value={visibility}
                    onChange={(e) =>
                      setVisibility(e.target.value as 'PUBLIC' | 'CONNECTIONS_ONLY' | 'PRIVATE')
                    }
                    style={{
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      height: '44px',
                      padding: '0 38px 0 14px',
                      border: '1px solid #E7E7EC',
                      borderRadius: '10px',
                      background: '#fff',
                      fontFamily: 'Inter,sans-serif',
                      fontSize: '14px',
                      color: '#0B0B0F',
                      outline: 'none',
                      width: '100%',
                      cursor: 'pointer',
                    }}
                  >
                    {VISIBILITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7A7A86"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
              <div style={fieldColStyle}>
                <label style={labelStyle}>Preferred locations</label>
                <span style={{ fontSize: '12px', color: '#9A9AA4', marginTop: '-5px' }}>
                  Comma-separated
                </span>
                <input
                  value={preferredLocations}
                  onChange={(e) => setPreferredLocations(e.target.value)}
                  placeholder="Bengaluru, Remote, Mumbai"
                  style={inputStyle}
                />
              </div>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              <span
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  background: openToWork ? '#5B4BF5' : '#fff',
                  border: openToWork ? 'none' : '1px solid #E7E7EC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                {openToWork && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={openToWork}
                onChange={(e) => setOpenToWork(e.target.checked)}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
              <span>
                <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#0B0B0F' }}>
                  Open to new opportunities
                </span>
                <span style={{ display: 'block', fontSize: '12.5px', color: '#9A9AA4', marginTop: '3px' }}>
                  Show recruiters you're available and surface matching jobs.
                </span>
              </span>
            </label>

            {renderMsg(profileMsg)}

            <div className="r-sticky-cta settings-save" style={{ display: 'flex', paddingTop: '8px', borderTop: '1px solid #E7E7EC', marginTop: '6px' }}>
              <button
                onClick={saveProfile}
                disabled={profileSaving}
                style={{
                  ...primaryBtnStyle,
                  marginTop: '22px',
                  opacity: profileSaving ? 0.6 : 1,
                  cursor: profileSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {profileSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        )}

        {tab === 'Security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <p style={{ fontSize: '13.5px', color: '#7A7A86', margin: 0, fontFamily: 'Inter,sans-serif' }}>
              Use a strong password of at least 8 characters.
            </p>

            <div style={fieldColStyle}>
              <label style={labelStyle}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            <div data-r="cols1-sm" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px' }}>
              <div style={fieldColStyle}>
                <label style={labelStyle}>New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>
              <div style={fieldColStyle}>
                <label style={labelStyle}>Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>
            </div>

            {renderMsg(pwMsg)}

            <div className="r-sticky-cta settings-save" style={{ display: 'flex', paddingTop: '8px', borderTop: '1px solid #E7E7EC', marginTop: '6px' }}>
              <button
                onClick={changePassword}
                disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
                style={{
                  ...primaryBtnStyle,
                  marginTop: '22px',
                  opacity: pwSaving || !currentPassword || !newPassword || !confirmPassword ? 0.6 : 1,
                  cursor:
                    pwSaving || !currentPassword || !newPassword || !confirmPassword
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {pwSaving ? 'Changing…' : 'Change password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
