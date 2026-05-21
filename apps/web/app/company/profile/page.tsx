'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, CompanyDetail } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { TextInput } from '@/components/ui/TextInput';

function VerificationBadge({ status }: { status: string }) {
  let color = 'var(--text-mute)';
  let bg = 'var(--bg-2)';
  if (status === 'VERIFIED') {
    color = 'var(--emerald)';
    bg = 'color-mix(in oklch, var(--emerald) 14%, transparent)';
  } else if (status === 'PENDING') {
    color = 'var(--gold)';
    bg = 'color-mix(in oklch, var(--gold) 14%, transparent)';
  }
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 10.5,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 5,
        background: bg,
        color,
        letterSpacing: '0.05em',
      }}
    >
      {status}
    </span>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-dim)' }}>
        {label}
        {required && <span style={{ color: 'var(--cool)', marginLeft: 3 }}>*</span>}
      </span>
    </div>
  );
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('COMPANY');

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [website, setWebsite] = useState('');
  const [about, setAbout] = useState('');
  const [locations, setLocations] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);

  const companyId = user?.companyMemberships?.[0]?.companyId;

  useEffect(() => {
    if (authLoading || !user) return;
    if (!companyId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.companies
      .get(companyId)
      .then((res) => {
        if (cancelled) return;
        setCompany(res);
        setName(res.name ?? '');
        setIndustry(res.industry ?? '');
        setSize(res.size ?? '');
        setWebsite(res.website ?? '');
        setAbout(res.about ?? '');
        setLocations((res.locations ?? []).join(', '));
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load company profile.');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [authLoading, user, companyId]);

  async function handleSave() {
    if (!companyId || !name.trim()) return;
    setSaving(true);
    setSaveError(null);
    setSavedMsg(false);
    try {
      const updated = await api.companies.update(companyId, {
        name: name.trim(),
        industry: industry.trim() || undefined,
        size: size.trim() || undefined,
        website: website.trim() || undefined,
        about: about.trim() || undefined,
        locations: locations.trim()
          ? locations.split(',').map((l) => l.trim()).filter(Boolean)
          : [],
      });
      setCompany(updated);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } catch (err: unknown) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: 32, color: 'var(--text-mute)', fontSize: 14 }}>
        Loading…
      </div>
    );
  }

  if (!companyId) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
        Company profile not set up. Please complete your company onboarding first.
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>
            Company Profile
          </h1>
          <p style={{ color: 'var(--text-mute)', fontSize: 13, margin: '4px 0 0' }}>
            Update your company details visible to salespersons on the platform.
          </p>
        </div>

        <Card padding={28}>
          {/* Verification badge */}
          {company && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-2)', border: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text-dim)', fontWeight: 500 }}>Verification status:</span>
              <VerificationBadge status={company.verification} />
            </div>
          )}

          {/* Row 1: Name + Industry */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <FieldLabel label="Company name" required />
              <TextInput
                value={name}
                onChange={(v) => setName(v)}
                placeholder="Acme Corp"
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <FieldLabel label="Industry" />
              <TextInput
                value={industry}
                onChange={(v) => setIndustry(v)}
                placeholder="SaaS, FinTech…"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Row 2: Size + Website */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <FieldLabel label="Company size" />
              <TextInput
                value={size}
                onChange={(v) => setSize(v)}
                placeholder="50-200"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <FieldLabel label="Website" />
              <TextInput
                value={website}
                onChange={(v) => setWebsite(v)}
                placeholder="https://..."
                type="url"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* About — full width */}
          <div style={{ marginBottom: 14 }}>
            <FieldLabel label="About" />
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell candidates about your company, culture, and mission…"
              rows={4}
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 13.5,
                color: 'var(--text)',
                width: '100%',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Locations — full width */}
          <div style={{ marginBottom: 24 }}>
            <FieldLabel label="Locations" />
            <TextInput
              value={locations}
              onChange={(v) => setLocations(v)}
              placeholder="Bangalore, Mumbai"
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 5 }}>
              Separate multiple locations with commas.
            </div>
          </div>

          {/* Save error */}
          {saveError && (
            <div
              style={{
                marginBottom: 14,
                padding: '10px 14px',
                borderRadius: 8,
                background: 'color-mix(in oklch, var(--r-master) 12%, transparent)',
                border: '1px solid color-mix(in oklch, var(--r-master) 30%, transparent)',
                color: 'var(--text-dim)',
                fontSize: 13,
              }}
            >
              {saveError}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Btn kind="ghost" size="md" onClick={() => router.push('/company')}>
              Back
            </Btn>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {savedMsg && (
                <span style={{ fontSize: 13, color: 'var(--emerald)', fontWeight: 600 }}>
                  Saved!
                </span>
              )}
              <Btn
                kind="primary"
                size="md"
                disabled={saving || !name.trim()}
                style={{ background: 'var(--cool)', color: 'white', opacity: saving ? 0.6 : 1 }}
                onClick={handleSave}
              >
                {saving ? 'Saving…' : 'Save changes'}
              </Btn>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
