'use client';

/**
 * Minimal client-side auth context. Wraps the api client's token store and
 * exposes the current user + login/register/logout helpers. SSR-safe: all
 * window access goes through `tokenStore` which guards `typeof window`.
 *
 * Not using cookies / middleware-based route protection yet — that's a
 * hardening pass. Protected pages call `useRequireAuth(role?)` which
 * redirects to /login if no token is present after first render.
 */

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, MeResponse, UserRole, api, tokenStore } from './api';

interface AuthState {
  user: MeResponse | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<MeResponse>;
  register: (dto: {
    email: string;
    password: string;
    name: string;
    role: 'SALESPERSON' | 'COMPANY';
    companyName?: string;
  }) => Promise<MeResponse>;
  loginWithGoogle: (dto: {
    idToken: string;
    role?: 'SALESPERSON' | 'COMPANY';
    companyName?: string;
  }) => Promise<{ user: MeResponse; isNewUser: boolean }>;
  logout: (redirectTo?: string) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setState({ user: null, loading: false, error: null });
      return;
    }
    try {
      const user = await api.users.me();
      setState({ user, loading: false, error: null });
    } catch (err) {
      // 401 already cleared the token in api.ts
      setState({
        user: null,
        loading: false,
        error: err instanceof ApiError ? err.message : 'Failed to load profile.',
      });
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  // bfcache defence — when the browser restores a page from back/forward
  // cache (Chrome, Safari), all JS state is restored as-is. Without this
  // handler, a user who logged out and then hit Back would see the prior
  // page rendered with the *old* AuthProvider state (user populated) until
  // some other effect happened to re-run. Re-verifying on pageshow with
  // `persisted` clears any stale user + lets useRequireAuth redirect.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onPageShow = (e: PageTransitionEvent) => { if (e.persisted) void refresh(); };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    tokenStore.set(res.accessToken);
    const user = await api.users.me();
    setState({ user, loading: false, error: null });
    return user;
  }, []);

  const register = useCallback(
    async (dto: Parameters<AuthContextValue['register']>[0]) => {
      const res = await api.auth.register(dto);
      tokenStore.set(res.accessToken);
      const user = await api.users.me();
      setState({ user, loading: false, error: null });
      return user;
    },
    [],
  );

  const loginWithGoogle = useCallback(
    async (dto: Parameters<AuthContextValue['loginWithGoogle']>[0]) => {
      const res = await api.auth.google(dto);
      tokenStore.set(res.accessToken);
      const user = await api.users.me();
      setState({ user, loading: false, error: null });
      return { user, isNewUser: res.isNewUser === true };
    },
    [],
  );

  const logout = useCallback((redirectTo: string = '/login') => {
    tokenStore.clear();
    setState({ user: null, loading: false, error: null });
    // Full-page navigation (not router.replace) — this nukes the Next.js
    // client cache + React tree so the browser back button can't restore a
    // stale logged-in page. Without this, the previous route's RSC payload
    // + prior AuthProvider snapshot could re-render with the old user
    // object before useRequireAuth had a chance to redirect.
    if (typeof window !== 'undefined') window.location.replace(redirectTo);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithGoogle, logout, refresh }}>
      <ImpersonationBanner />
      {children}
    </AuthContext.Provider>
  );
}

/** Red banner + exit action shown whenever the current JWT was minted by
 *  an admin impersonating another user. Detects the impersonatedBy claim
 *  by parsing the JWT payload (base64-decoded; no verification needed —
 *  the server already verified when the token was accepted for /me). */
function ImpersonationBanner() {
  const [claim, setClaim] = useState<{ impersonatedBy: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const check = () => {
      const t = tokenStore.get();
      if (!t) return setClaim(null);
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        if (payload.impersonatedBy) {
          setClaim({ impersonatedBy: payload.impersonatedBy, email: payload.email });
        } else {
          setClaim(null);
        }
      } catch {
        setClaim(null);
      }
    };
    check();
    // Re-check on storage events (impersonate/exit changes localStorage).
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }, []);

  if (!claim) return null;

  function exitImpersonation() {
    if (typeof window === 'undefined') return;
    const orig = localStorage.getItem('closdex.token.orig');
    if (orig) {
      tokenStore.set(orig);
      localStorage.removeItem('closdex.token.orig');
    } else {
      tokenStore.clear();
    }
    window.location.href = '/admin/users';
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        padding: '10px 16px',
        background: 'var(--d-expert, #A93F37)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.01em',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      <span>Impersonating {claim.email}</span>
      <button
        type="button"
        onClick={exitImpersonation}
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: 6,
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Exit impersonation
      </button>
    </div>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}

/** Hard redirect to /login if not signed in. Optionally enforces a role. */
export function useRequireAuth(role?: UserRole) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (role && user.role !== role) router.replace(landingPathFor(user.role));
  }, [user, loading, role, router]);
  return { user, loading };
}

/** Default-landing target derived from a user's role. */
export function landingPathFor(role: UserRole): string {
  if (role === 'COMPANY') return '/company';
  if (role === 'ADMIN') return '/admin';
  return '/dashboard';
}
