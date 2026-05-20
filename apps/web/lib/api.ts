/**
 * Typed API client for the Closdex backend (NestJS).
 *
 * Token strategy: JWT held in localStorage under TOKEN_KEY. On every request
 * the token (if present) is sent as `Authorization: Bearer …`. This is the MVP
 * — a follow-up slice can move to an httpOnly cookie + /auth/refresh route.
 *
 * Error model: every method either resolves with the parsed JSON body or
 * throws an `ApiError` with { status, message, body }. The status === 401
 * branch clears the token so callers can redirect to /login without leaking
 * a stale session.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'closdex.token';

// ─── token storage ──────────────────────────────────────────────────────

export const tokenStore = {
  get(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  set(token: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  clear() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(TOKEN_KEY);
  },
};

// ─── error type ─────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

// ─── core fetch wrapper ─────────────────────────────────────────────────

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(
  method: Method,
  path: string,
  options: { body?: unknown; query?: Record<string, unknown> } = {},
): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (options.query) {
    for (const [k, v] of Object.entries(options.query)) {
      if (v === undefined || v === null || v === '') continue;
      if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, String(item)));
      else url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }

  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    const msg =
      (typeof body === 'object' && body && 'message' in body && typeof (body as any).message === 'string'
        ? (body as any).message
        : null) ?? res.statusText ?? `HTTP ${res.status}`;
    throw new ApiError(res.status, Array.isArray(msg) ? msg.join(', ') : msg, body);
  }

  return body as T;
}

// ─── shared response types ──────────────────────────────────────────────

export type UserRole = 'SALESPERSON' | 'COMPANY' | 'ADMIN';

export interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; role: UserRole };
}

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  salesperson?: {
    id: string;
    publicSlug: string;
    headline?: string | null;
    bio?: string | null;
    location?: string | null;
    experienceYears?: number | null;
    rank: string;
    totalPoints: number;
    openToWork: boolean;
    expectedCtc?: string | null;
    noticePeriodDays?: number | null;
    specializationTags: string[];
  } | null;
  companyMemberships?: Array<{
    companyId: string;
    companyRole: string;
    company: { id: string; name: string };
  }>;
}

export interface ChallengeSummary {
  id: string;
  title: string;
  brief: string;
  category: string;
  difficulty: 'ROOKIE' | 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  goalType: string;
  goalDescription: string;
  basePoints: number;
  maxMessages: number;
  estimatedMinutes: number;
  attemptsAllowed: number | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  persona: { id: string; name: string; role?: string | null; company?: string | null; contextSnippet?: string | null };
}

export interface ChallengeMessage {
  id: string;
  sender: 'SALESPERSON' | 'LEAD' | 'SYSTEM';
  content: string;
  createdAt: string;
}

export interface AttemptDetail {
  id: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  attemptNumber: number;
  messagesUsed: number;
  startedAt: string;
  completedAt?: string | null;
  goalAchieved?: boolean | null;
  score?: number | null;
  pointsAwarded?: number | null;
  rubricScores?: Record<string, number> | null;
  feedback?: string | null;
  challenge: ChallengeSummary;
  conversation: { id: string; messages: ChallengeMessage[] };
}

export interface JobSummary {
  id: string;
  title: string;
  location?: string | null;
  workMode?: string | null;
  status: string;
  ctcMin?: number | null;
  ctcMax?: number | null;
  specializationTags: string[];
  postedAt?: string | null;
  company: { id: string; name: string };
}

export interface TalentSummary {
  id: string;
  publicSlug: string;
  headline?: string | null;
  location?: string | null;
  experienceYears?: number | null;
  rank: string;
  points: number;
  openToWork: boolean;
  expectedCtc?: string | null;
  specializationTags: string[];
  user: { name: string };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  points: number;
  rankBadge?: string;
}

// ─── public API surface ─────────────────────────────────────────────────

export const api = {
  auth: {
    register: (dto: {
      email: string;
      password: string;
      name: string;
      role: 'SALESPERSON' | 'COMPANY';
      companyName?: string;
    }) => request<AuthResponse>('POST', '/auth/register', { body: dto }),
    login: (dto: { email: string; password: string }) =>
      request<AuthResponse>('POST', '/auth/login', { body: dto }),
  },

  users: {
    me: () => request<MeResponse>('GET', '/users/me'),
    updateMe: (dto: Partial<Pick<MeResponse, 'name'>>) =>
      request<MeResponse>('PATCH', '/users/me', { body: dto }),
    updateSalesperson: (dto: {
      headline?: string;
      bio?: string;
      location?: string;
      experienceYears?: number;
      openToWork?: boolean;
      expectedCtc?: string;
      noticePeriodDays?: number;
      specializationTags?: string[];
    }) => request<MeResponse>('PATCH', '/users/me/salesperson', { body: dto }),
  },

  challenges: {
    list: (query: {
      difficulty?: string;
      goalType?: string;
      category?: string;
      page?: number;
      perPage?: number;
    } = {}) =>
      request<{ items: ChallengeSummary[]; total: number; page: number; perPage: number }>(
        'GET',
        '/challenges',
        { query },
      ),
    get: (id: string) => request<ChallengeSummary>('GET', `/challenges/${id}`),
  },

  attempts: {
    start: (challengeId: string) =>
      request<AttemptDetail>('POST', `/challenges/${challengeId}/attempts`),
    listMine: () => request<AttemptDetail[]>('GET', '/attempts/me'),
    get: (id: string) => request<AttemptDetail>('GET', `/attempts/${id}`),
    send: (id: string, content: string) =>
      request<{ attempt: AttemptDetail; leadReply: string }>(
        'POST',
        `/attempts/${id}/messages`,
        { body: { content } },
      ),
    end: (id: string) => request<AttemptDetail>('POST', `/attempts/${id}/end`),
  },

  jobs: {
    list: (query: { location?: string; specializationTag?: string; page?: number; perPage?: number } = {}) =>
      request<{ items: JobSummary[]; total: number; page: number; perPage: number }>(
        'GET',
        '/jobs',
        { query },
      ),
    get: (id: string) => request<JobSummary>('GET', `/jobs/${id}`),
    apply: (id: string) => request<{ id: string; status: string }>('POST', `/jobs/${id}/apply`),
  },

  applications: {
    mine: () =>
      request<Array<{ id: string; status: string; job: JobSummary; createdAt: string }>>(
        'GET',
        '/applications/me',
      ),
  },

  talent: {
    search: (query: {
      minRank?: string;
      minPoints?: number;
      category?: string;
      location?: string;
      minExperienceYears?: number;
      openToWork?: boolean;
      specializationTags?: string[];
      page?: number;
      perPage?: number;
    } = {}) =>
      request<{ items: TalentSummary[]; total: number; page: number; perPage: number }>(
        'GET',
        '/talent',
        { query },
      ),
  },

  leaderboards: {
    list: (query: { period?: 'daily' | 'weekly' | 'monthly' | 'all-time'; category?: string; limit?: number } = {}) =>
      request<{ entries: LeaderboardEntry[] }>('GET', '/leaderboards', {
        query: { period: query.period ?? 'all-time', category: query.category, limit: query.limit },
      }),
  },
};

export type Api = typeof api;
