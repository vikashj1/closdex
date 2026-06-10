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
  }) => Promise<MeResponse>;
  logout: () => void;
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
      return user;
    },
    [],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setState({ user: null, loading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithGoogle, logout, refresh }}>
      {children}
    </AuthContext.Provider>
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
