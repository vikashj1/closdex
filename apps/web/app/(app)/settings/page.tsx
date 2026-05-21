'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { TextInput } from '@/components/ui/TextInput';
import { Field } from '@/components/ui/Field';
import { useRequireAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

const TABS = ['Profile', 'Security'] as const;
type Tab = (typeof TABS)[number];

const VISIBILITY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public — anyone can view your profile' },
  { value: 'CONNECTIONS_ONLY', label: 'Connections only' },
  { value: 'PRIVATE', label: 'Private — only you and companies you applied to' },
] as const;

export default function SettingsPage() {
  const { user, loading: authLoading, refresh } = useRequireAuth('SALESPERSON') as any;

  const [tab, setTab] = useState<Tab>('Profile');

  // Profile fields
  const [name, setName] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [openToWork, setOpenToWork] = useState(false);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'CONNECTIONS_ONLY' | 'PRIVATE'>('PUBLIC');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [preferredLocations, setPreferredLocations] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    const sp = user.salesperson;
    if (sp) {
      setResumeUrl(sp.resumeUrl ?? '');
      setOpenToWork(sp.openToWork ?? false);
      setVisibility((sp.visibility as any) ?? 'PUBLIC');
      setSalaryExpectation(sp.salaryExpectation?.toString() ?? '');
      setPreferredLocations((sp.preferredLocations ?? []).join(', '));
    }
  }, [user]);

  async function saveProfile() {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await api.users.updateMe({ name });
      await api.users.updateSalesperson({
        resumeUrl: resumeUrl || undefined,
        openToWork,
        visibility,
        salaryExpectation: salaryExpectation ? Number(salaryExpectation) : undefined,
        preferredLocations: preferredLocations
          ? preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      });
      if (typeof refresh === 'function') refresh();
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

  if (authLoading) return null;

  return (
    <div style={{ maxWidth: 680, margin: '40px auto', padding: '0 24px 80px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 24px' }}>Settings</h1>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 28,
          borderBottom: '1px solid var(--border-soft)',
          paddingBottom: 0,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
              color: tab === t ? 'var(--gold)' : 'var(--text-dim)',
              fontWeight: tab === t ? 600 : 400,
              fontSize: 14,
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Profile' && (
        <Card padding={28}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="Display name">
              <TextInput value={name} onChange={(v) => setName(v)} placeholder="Your full name" />
            </Field>

            <Field label="Resume URL">
              <TextInput
                value={resumeUrl}
                onChange={(v) => setResumeUrl(v)}
                placeholder="https://drive.google.com/..."
              />
            </Field>

            <Field label="Profile visibility">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: 14,
                }}
              >
                {VISIBILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Preferred locations (comma-separated)">
              <TextInput
                value={preferredLocations}
                onChange={(v) => setPreferredLocations(v)}
                placeholder="Mumbai, Bangalore, Remote"
              />
            </Field>

            <Field label="Expected CTC (₹ LPA)">
              <TextInput
                value={salaryExpectation}
                onChange={(v) => setSalaryExpectation(v)}
                placeholder="12"
                type="number"
              />
            </Field>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                fontSize: 14,
                color: 'var(--text)',
              }}
            >
              <input
                type="checkbox"
                checked={openToWork}
                onChange={(e) => setOpenToWork(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--emerald)' }}
              />
              Open to new opportunities
            </label>

            {profileMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: profileMsg.ok
                    ? 'color-mix(in oklch, var(--emerald) 15%, var(--surface))'
                    : 'color-mix(in oklch, #ef4444 15%, var(--surface))',
                  color: profileMsg.ok ? 'var(--emerald)' : '#ef4444',
                  fontSize: 13,
                }}
              >
                {profileMsg.text}
              </div>
            )}

            <Btn onClick={saveProfile} loading={profileSaving} style={{ alignSelf: 'flex-start' }}>
              Save changes
            </Btn>
          </div>
        </Card>
      )}

      {tab === 'Security' && (
        <Card padding={28}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ fontSize: 13.5, color: 'var(--text-dim)', margin: 0 }}>
              Use a strong password of at least 8 characters.
            </p>

            <Field label="Current password">
              <TextInput
                value={currentPassword}
                onChange={(v) => setCurrentPassword(v)}
                type="password"
                placeholder="••••••••"
              />
            </Field>

            <Field label="New password">
              <TextInput
                value={newPassword}
                onChange={(v) => setNewPassword(v)}
                type="password"
                placeholder="••••••••"
              />
            </Field>

            <Field label="Confirm new password">
              <TextInput
                value={confirmPassword}
                onChange={(v) => setConfirmPassword(v)}
                type="password"
                placeholder="••••••••"
              />
            </Field>

            {pwMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: pwMsg.ok
                    ? 'color-mix(in oklch, var(--emerald) 15%, var(--surface))'
                    : 'color-mix(in oklch, #ef4444 15%, var(--surface))',
                  color: pwMsg.ok ? 'var(--emerald)' : '#ef4444',
                  fontSize: 13,
                }}
              >
                {pwMsg.text}
              </div>
            )}

            <Btn
              onClick={changePassword}
              loading={pwSaving}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              style={{ alignSelf: 'flex-start' }}
            >
              Change password
            </Btn>
          </div>
        </Card>
      )}
    </div>
  );
}
