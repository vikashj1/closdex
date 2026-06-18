'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, NotificationItem } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth';

// Notifications — Vikash dashboard redesign 2026-06-16.
// Visual port of the new HTML, wired to real data.

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

function linkUrlFor(n: NotificationItem): string | null {
  const payload = (n.payload ?? {}) as Record<string, unknown>;
  const explicit = payload.linkUrl;
  if (typeof explicit === 'string' && explicit.length > 0) return explicit;
  return null;
}

export default function NotificationsPage() {
  useRequireAuth('SALESPERSON');
  const router = useRouter();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.notifications
      .listMine()
      .then((res) => {
        if (cancelled) return;
        const sorted = [...res.items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setItems(sorted);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load notifications.');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleItems = showUnreadOnly ? items.filter((n) => !n.read) : items;
  const unreadCount = items.filter((n) => !n.read).length;

  async function handleRowClick(n: NotificationItem) {
    if (!n.read) {
      try {
        await api.notifications.markRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      } catch {
        // best-effort — UI continues regardless
      }
    }
    const url = linkUrlFor(n);
    if (url) router.push(url);
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await api.notifications.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to mark all read.');
    } finally {
      setMarkingAll(false);
    }
  }

  function iconPathFor(type: string): string {
    switch (type) {
      case 'APPLICATION_HIRED':
      case 'APPLICATION_OFFER':
      case 'APPLICATION_SHORTLISTED':
      case 'APPLICATION_VIEWED':
      case 'APPLICATION_STATUS':
        return 'M20 6 9 17l-5-5';
      case 'INTERVIEW_SCHEDULED':
        return 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z';
      case 'BADGE_AWARDED':
        return 'M12 15l-3.5 2 1-4-3-2.5 4-.5L12 6l1.5 4 4 .5-3 2.5 1 4z';
      case 'RANK_UP':
        return 'M12 19V5M5 12l7-7 7 7';
      case 'CHALLENGE_SCORED':
        return 'M22 11.08V12a10 10 0 1 1-5.93-9.14';
      case 'DISPUTE_RESOLVED':
        return 'M14 9V5a3 3 0 0 0-6 0v4M5 9h14l-1 12H6L5 9z';
      default:
        return 'M12 8v4M12 16h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z';
    }
  }

  return (
    <div>
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '34px 40px 72px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
            marginBottom: '30px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
            <h1
              style={{
                margin: '0',
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: '700',
                fontSize: '33px',
                letterSpacing: '-0.03em',
                lineHeight: '1.05',
                color: '#0B0B0F',
              }}
            >
              Notifications
            </h1>
            <span
              style={{
                fontFamily: "'Space Mono',monospace",
                fontSize: '11.5px',
                fontWeight: '700',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#3A2DC4',
              }}
            >
              {unreadCount} unread
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <label
              onClick={() => setShowUnreadOnly((p) => !p)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '9px',
                cursor: 'pointer',
                fontSize: '13.5px',
                fontWeight: '500',
                color: '#3A3A44',
              }}
            >
              Unread only
              <span
                style={{
                  position: 'relative',
                  width: '38px',
                  height: '22px',
                  borderRadius: '100px',
                  background: showUnreadOnly ? '#5B4BF5' : '#E7E7EC',
                  display: 'inline-block',
                  transition: 'background 0.15s ease',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '3px',
                    left: showUnreadOnly ? '19px' : '3px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    transition: 'left 0.15s ease',
                  }}
                ></span>
              </span>
            </label>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markingAll || unreadCount === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                height: '36px',
                padding: '0 14px',
                border: '1px solid #E7E7EC',
                borderRadius: '10px',
                background: '#fff',
                fontFamily: 'Inter,sans-serif',
                fontSize: '13px',
                fontWeight: '600',
                color: '#3A3A44',
                cursor: markingAll || unreadCount === 0 ? 'not-allowed' : 'pointer',
                opacity: markingAll || unreadCount === 0 ? 0.5 : 1,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              {markingAll ? 'Marking…' : 'Mark all read'}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '10px',
              marginBottom: '18px',
              fontSize: '13.5px',
              background: 'rgba(220,38,38,0.06)',
              border: '1px solid rgba(220,38,38,0.25)',
              color: '#B91C1C',
            }}
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            style={{
              padding: '80px 0',
              textAlign: 'center',
              color: '#9A9AA4',
              fontSize: '14px',
              fontFamily: "'Space Mono',monospace",
              letterSpacing: '0.04em',
            }}
          >
            Loading notifications…
          </div>
        )}

        {!loading && !error && visibleItems.length === 0 && (
          <div
            style={{
              padding: '80px 32px',
              textAlign: 'center',
              color: '#7A7A86',
              fontSize: '14px',
              background: 'rgba(91,75,245,0.025)',
              borderRadius: '12px',
              border: '1px dashed #E7E7EC',
            }}
          >
            {showUnreadOnly ? 'No unread notifications.' : 'No notifications yet.'}
          </div>
        )}

        {!loading && visibleItems.length > 0 && (
          <div>
            {visibleItems.map((n, idx) => {
              const unread = !n.read;
              const url = linkUrlFor(n);
              const clickable = unread || url !== null;
              const isLast = idx === visibleItems.length - 1;
              return (
                <div
                  key={n.id}
                  onClick={() => handleRowClick(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '15px',
                    padding: '20px 6px',
                    borderTop: '1px solid #E7E7EC',
                    borderBottom: isLast ? '1px solid #E7E7EC' : undefined,
                    background: unread ? 'rgba(91,75,245,0.025)' : 'transparent',
                    cursor: clickable ? 'pointer' : 'default',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: unread ? '#5B4BF5' : 'transparent',
                      marginTop: '6px',
                      flexShrink: '0',
                    }}
                  ></span>
                  <div style={{ flex: '1', minWidth: '0' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        marginBottom: '5px',
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={unread ? '#3A2DC4' : '#9A9AA4'}
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ flexShrink: 0 }}
                      >
                        <path d={iconPathFor(n.type)} />
                      </svg>
                      <span
                        style={{
                          fontSize: '14.5px',
                          fontWeight: '600',
                          color: '#0B0B0F',
                        }}
                      >
                        {n.title}
                      </span>
                      {unread && (
                        <span
                          style={{
                            fontFamily: "'Space Mono',monospace",
                            fontSize: '9px',
                            fontWeight: '700',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: '#3A2DC4',
                            background: 'rgba(91,75,245,0.1)',
                            padding: '2px 6px',
                            borderRadius: '5px',
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '13.5px',
                        lineHeight: '1.5',
                        color: '#7A7A86',
                      }}
                    >
                      {n.body}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: '11px',
                      letterSpacing: '0.04em',
                      color: '#9A9AA4',
                      flexShrink: '0',
                      marginTop: '2px',
                    }}
                  >
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
