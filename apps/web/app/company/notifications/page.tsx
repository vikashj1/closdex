'use client';

import { useEffect, useState } from 'react';
import { api, ApiError, NotificationItem } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const TYPE_COLORS: Record<string, string> = {
  APPLICATION_STATUS: 'var(--cool)',
  NEW_APPLICATION:    'var(--emerald)',
  PLACEMENT_CONFIRM:  'var(--gold)',
  INVOICE_ISSUED:     'var(--cool)',
  INVOICE_PAID:       'var(--emerald)',
};

export default function CompanyNotificationsPage() {
  useRequireAuth('COMPANY');

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = items.filter(n => !n.read).length;

  useEffect(() => {
    setLoading(true); setError(null);
    api.notifications.listMine(showUnreadOnly || undefined)
      .then(res => { setItems(res.items); setLoading(false); })
      .catch(err => { setError(err instanceof ApiError ? err.message : 'Could not load notifications.'); setLoading(false); });
  }, [showUnreadOnly]);

  async function markRead(id: string) {
    try {
      await api.notifications.markRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { /* silent */ }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await api.notifications.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed.');
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h1 className="display" style={{ fontSize: 28, margin: 0, fontWeight: 700 }}>Notifications</h1>
          {unreadCount > 0 && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-mute)' }}>{unreadCount} unread</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowUnreadOnly(p => !p)}
            style={{
              background: showUnreadOnly ? 'color-mix(in oklch, var(--cool) 14%, transparent)' : 'var(--bg-2)',
              border: `1px solid ${showUnreadOnly ? 'var(--cool)' : 'var(--border)'}`,
              color: showUnreadOnly ? 'var(--cool)' : 'var(--text-dim)',
              borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            }}>
            Unread only
          </button>
          {unreadCount > 0 && (
            <Btn kind="ghost" size="sm" onClick={markAllRead} disabled={markingAll}>
              {markingAll ? 'Marking…' : 'Mark all read'}
            </Btn>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, background: 'color-mix(in oklch, red 10%, transparent)', border: '1px solid color-mix(in oklch, red 25%, transparent)', color: 'var(--text-dim)' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14 }}>Loading…</div>
      )}

      {!loading && items.length === 0 && !error && (
        <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-mute)', fontSize: 14, background: 'var(--bg-2)', borderRadius: 12, border: '1px dashed var(--border)' }}>
          {showUnreadOnly ? 'No unread notifications.' : 'No notifications yet.'}
        </div>
      )}

      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(n => {
            const dot = TYPE_COLORS[n.type] ?? 'var(--text-mute)';
            return (
              <Card key={n.id} padding={16}
                style={{
                  opacity: n.read ? 0.7 : 1,
                  cursor: n.read ? 'default' : 'pointer',
                  background: n.read ? 'var(--bg-2)' : 'var(--surface)',
                  borderLeft: n.read ? 'none' : '3px solid var(--cool)',
                }}
                onClick={() => { if (!n.read) markRead(n.id); }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0, marginTop: 6 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13.5, fontWeight: n.read ? 500 : 700 }}>{n.title}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-mute)', flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>{n.body}</p>
                    {!n.read && (
                      <span style={{ fontSize: 10.5, color: 'var(--cool)', fontWeight: 700, letterSpacing: '0.05em', marginTop: 6, display: 'inline-block' }}>NEW</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
