'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { TextInput } from '@/components/ui/TextInput';
import { Field } from '@/components/ui/Field';
import { useAuth, useRequireAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';

const TABS = ['Account', 'Company'] as const;
type Tab = (typeof TABS)[number];

export default function CompanySettingsPage() {
  const { refresh } = useAuth();
  const { user, loading: authLoading } = useRequireAuth('COMPANY');

  const [tab, setTab] = useState<Tab>('Account');

  // Account fields
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acctSaving, setAcctSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [acctMsg, setAcctMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Company fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [about, setAbout] = useState('');
  const [companySaving, setCompanySaving] = useState(false);
  const [companyMsg, setCompanyMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const companyId = user?.companyMemberships?.[0]?.companyId ?? null;

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    if (companyId) {
      api.companies.get(companyId).then((c) => {
        setCompanyName(c.name ?? '');
        setWebsite(c.website ?? '');
        setIndustry(c.industry ?? '');
        setLogoUrl(c.logoUrl ?? '');
        setAbout(c.about ?? '');
      }).catch(() => {});
    }
  }, [user, companyId]);

  async function saveAccount() {
    setAcctSaving(true);
    setAcctMsg(null);
    try {
      await api.users.updateMe({ name });
      void refresh();
      setAcctMsg({ ok: true, text: 'Account updated.' });
    } catch (e) {
      setAcctMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Failed to save.' });
    } finally {
      setAcctSaving(false);
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

  async function saveCompany() {
    if (!companyId) return;
    setCompanySaving(true);
    setCompanyMsg(null);
    try {
      await api.companies.update(companyId, {
        name: companyName || undefined,
        website: website || undefined,
        industry: industry || undefined,
        logoUrl: logoUrl || undefined,
        about: about || undefined,
      });
      void refresh();
      setCompanyMsg({ ok: true, text: 'Company profile updated.' });
    } catch (e) {
      setCompanyMsg({ ok: false, text: e instanceof ApiError ? e.message : 'Failed to save.' });
    } finally {
      setCompanySaving(false);
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
              borderBottom: tab === t ? '2px solid var(--cool)' : '2px solid transparent',
              color: tab === t ? 'var(--cool)' : 'var(--text-dim)',
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

      {tab === 'Account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card padding={28}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 20px' }}>Display name</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Your name">
                <TextInput value={name} onChange={setName} placeholder="Your full name" />
              </Field>
              {acctMsg && <Msg ok={acctMsg.ok} text={acctMsg.text} />}
              <Btn onClick={saveAccount} loading={acctSaving} style={{ alignSelf: 'flex-start' }}>
                Save name
              </Btn>
            </div>
          </Card>

          <Card padding={28}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Change password</h2>
            <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: '0 0 20px' }}>
              Use a strong password of at least 8 characters.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Current password">
                <TextInput value={currentPassword} onChange={setCurrentPassword} type="password" placeholder="••••••••" />
              </Field>
              <Field label="New password">
                <TextInput value={newPassword} onChange={setNewPassword} type="password" placeholder="••••••••" />
              </Field>
              <Field label="Confirm new password">
                <TextInput value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="••••••••" />
              </Field>
              {pwMsg && <Msg ok={pwMsg.ok} text={pwMsg.text} />}
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
        </div>
      )}

      {tab === 'Company' && (
        <Card padding={28}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="Company name">
              <TextInput value={companyName} onChange={setCompanyName} placeholder="Acme Corp" />
            </Field>
            <Field label="Industry">
              <TextInput value={industry} onChange={setIndustry} placeholder="SaaS, FinTech, EdTech…" />
            </Field>
            <Field label="Website">
              <TextInput value={website} onChange={setWebsite} placeholder="https://yourcompany.com" />
            </Field>
            <Field label="Logo URL">
              <TextInput value={logoUrl} onChange={setLogoUrl} placeholder="https://yourcompany.com/logo.png" />
            </Field>
            <Field label="About">
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell candidates about your company, culture, and mission…"
                rows={5}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  fontSize: 14,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </Field>
            {companyMsg && <Msg ok={companyMsg.ok} text={companyMsg.text} />}
            <Btn onClick={saveCompany} loading={companySaving} style={{ alignSelf: 'flex-start' }}>
              Save company profile
            </Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

function Msg({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: ok
          ? 'color-mix(in oklch, var(--emerald) 15%, var(--surface))'
          : 'color-mix(in oklch, #ef4444 15%, var(--surface))',
        color: ok ? 'var(--emerald)' : '#ef4444',
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );
}
