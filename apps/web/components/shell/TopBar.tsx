'use client';

import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { RankBadge } from '@/components/ui/RankBadge';
import { Icon } from '@/components/ui/Icon';

export function TopBar() {
  const router = useRouter();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        borderBottom: '1px solid var(--border-soft)',
        background: 'var(--bg)',
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}
    >
      <div style={{ position: 'relative', flex: '0 1 420px' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-mute)' }}>
          <Icon.search />
        </span>
        <input
          placeholder="Search challenges, companies, salespersons…"
          style={{
            width: '100%',
            padding: '9px 12px 9px 36px',
            borderRadius: 9,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            fontSize: 13,
            color: 'var(--text)',
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', position: 'relative' }}>
          <Icon.bell />
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: 999,
              background: 'var(--d-expert)',
              border: '2px solid var(--bg)',
            }}
          />
        </button>
        <div
          onClick={() => router.push('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 10px 4px 4px',
            background: 'var(--bg-2)',
            borderRadius: 999,
            border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
        >
          <Avatar name="Shashank Khare" size={28} />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Shashank</span>
          <RankBadge rank="Gold" size={16} />
        </div>
      </div>
    </div>
  );
}
