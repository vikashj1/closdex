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

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';
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

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

async function request<T>(
  method: Method,
  path: string,
  options: { body?: unknown; query?: Record<string, unknown> } = {},
): Promise<T> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000';
  const url = new URL(`${BASE}${path}`, origin);
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
  location?: string | null;
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
    currentStreakDays: number;
    resumeUrl?: string | null;
    visibility?: string | null;
    salaryExpectation?: number | null;
    preferredLocations?: string[];
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
  status: string;
  specializationTag?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  postedAt?: string | null;
  company: { id: string; name: string };
}

export interface JobDetail extends JobSummary {
  description?: string | null;
  requiredSkills?: string[];
  experienceMinYears?: number | null;
  experienceMaxYears?: number | null;
  employmentType?: string | null;
  minRank?: string | null;
  listingTier?: string | null;
  applicationDeadline?: string | null;
  company: { id: string; name: string; logoUrl?: string | null; industry?: string | null };
}

export interface TalentSummary {
  id: string;
  publicSlug: string;
  headline?: string | null;
  location?: string | null;
  experienceYears?: number | null;
  rank: string;
  totalPoints: number;
  openToWork: boolean;
  expectedCtc?: string | null;
  specializationTags: string[];
  user: { name: string };
}

export interface EarnedBadge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}

export interface TalentDetail {
  id: string;
  publicSlug: string;
  rank: string;
  totalPoints: number;
  experienceYears: number;
  specializationTags: string[];
  openToWork: boolean;
  currentCompany?: string | null;
  currentStreakDays: number;
  resumeUrl?: string | null;
  user: { name: string; photoUrl?: string | null; location?: string | null };
  badges: EarnedBadge[];
  _stats: { totalAttempts: number; completedAttempts: number; winRate: number };
}

export interface CompanyDetail {
  id: string;
  name: string;
  logoUrl?: string | null;
  industry?: string | null;
  size?: string | null;
  locations: string[];
  website?: string | null;
  about?: string | null;
  perks?: string | null;
  culture?: string | null;
  incentiveStructure?: string | null;
  verification: string;
}

export interface ShortlistSummary {
  id: string;
  name: string;
  companyId: string;
  createdAt: string;
  _count: { entries: number };
}

export interface ShortlistDetail {
  id: string;
  name: string;
  companyId: string;
  createdAt: string;
  entries: Array<{
    id: string;
    createdAt: string;
    salesperson: {
      id: string;
      publicSlug: string;
      rank: string;
      totalPoints: number;
      experienceYears?: number | null;
      specializationTags: string[];
      openToWork: boolean;
      user: { name: string; photoUrl?: string | null; location?: string | null };
    };
  }>;
}

export interface PlacementSummary {
  id: string;
  status: string;
  annualCtc: number;
  commissionAmount: number;
  confirmedAt: string;
  job: { id: string; title: string };
  salesperson: {
    id: string;
    publicSlug: string;
    rank: string;
    user: { name: string };
  };
  invoice?: { id: string; number: string; status: string; amount: number } | null;
}

export interface LearningTrackSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  order: number;
  tutorials: Array<{ id: string; title: string; type: 'VIDEO' | 'ARTICLE'; order: number }>;
}

export interface TutorialDetail {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE';
  contentUrl?: string | null;
  body?: string | null;
  order: number;
  trackId: string;
  track: { id: string; title: string; category: string };
  quiz?: {
    id: string;
    rewardPoints: number;
    questions: Array<{ q: string; options: string[] }>;
  } | null;
}

export interface TrackProgress {
  trackId: string;
  completedTutorialIds: string[];
  track: {
    id: string;
    title: string;
    category: string;
    tutorials: Array<{ id: string }>;
  };
}

export interface LeaderboardEntry {
  position: number;
  score: number;
  salesperson: {
    publicSlug: string;
    name: string;
    photoUrl: string | null;
    rank: string;
    totalPoints: number;
  };
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  payload?: Record<string, unknown> | null;
}

export interface BadgeDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl?: string | null;
}

export interface EarnedBadge extends BadgeDefinition {
  awardedAt: string;
}

export interface ProfileViewItem {
  id: string;
  viewedAt: string;
  viewerCompany: string | null;
  viewerName: string | null;
  viewerRole: string | null;
  viewerPhotoUrl: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SALESPERSON' | 'COMPANY' | 'ADMIN';
  createdAt: string;
  salesperson?: { totalPoints: number; rank: string } | null;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; email: string };
}

export interface DisputeSummary {
  id: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  reason: string;
  resolution?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  attempt: { id: string; challenge: { id: string; title: string } };
  salesperson: { id: string; publicSlug: string; user: { name: string } };
}

export interface VerificationCompany {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  verification: string;
  createdAt?: string;
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
    updateMe: (dto: Partial<Pick<MeResponse, 'name' | 'location'>>) =>
      request<MeResponse>('PATCH', '/users/me', { body: dto }),
    updateSalesperson: (dto: {
      experienceYears?: number;
      currentCompany?: string;
      specializationTags?: string[];
      skillSelfAssessment?: number;
      resumeUrl?: string;
      openToWork?: boolean;
      preferredLocations?: string[];
      salaryExpectation?: number;
      visibility?: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
    }) => request<MeResponse>('PATCH', '/users/me/salesperson', { body: dto }),
    changePassword: (dto: { currentPassword: string; newPassword: string }) =>
      request<{ success: boolean }>('POST', '/users/me/password', { body: dto }),
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
    list: (query: { location?: string; specializationTag?: string; companyId?: string; page?: number; perPage?: number } = {}) =>
      request<{ items: JobSummary[]; total: number; page: number; perPage: number }>(
        'GET',
        '/jobs',
        { query },
      ),
    get: (id: string) => request<JobDetail>('GET', `/jobs/${id}`),
    apply: (id: string) => request<{ id: string; status: string }>('POST', `/jobs/${id}/apply`),
    create: (dto: {
      title: string;
      description: string;
      requiredSkills: string[];
      specializationTag: string;
      experienceMinYears: number;
      location: string;
      salaryMin?: number;
      salaryMax?: number;
      minRank?: string;
      companyId?: string;
      listingTier?: string;
    }) => request<JobSummary>('POST', '/jobs', { body: dto }),
    publish: (id: string) => request<JobSummary>('POST', `/jobs/${id}/publish`),
    pause: (id: string) => request<JobSummary>('POST', `/jobs/${id}/pause`),
    close: (id: string) => request<JobSummary>('POST', `/jobs/${id}/close`),
    repost: (id: string) => request<JobSummary>('POST', `/jobs/${id}/repost`),
    update: (id: string, dto: {
      title?: string;
      description?: string;
      requiredSkills?: string[];
      location?: string;
      salaryMin?: number;
      salaryMax?: number;
      experienceMinYears?: number;
      minRank?: string;
      specializationTag?: string;
      listingTier?: string;
    }) => request<JobSummary>('PATCH', `/jobs/${id}`, { body: dto }),
    listApplications: (id: string) =>
      request<Array<{ id: string; status: string; salesperson: { id: string; publicSlug: string; rank: string; totalPoints: number; user: { name: string } } }>>(
        'GET', `/jobs/${id}/applications`,
      ),
    save: (id: string) => request<{ saved: boolean }>('POST', `/jobs/${id}/save`),
    unsave: (id: string) => request<{ saved: boolean }>('DELETE', `/jobs/${id}/save`),
    listSaved: () => request<Array<JobSummary & { savedAt: string }>>('GET', '/jobs/saved/list'),
    savedJobIds: () => request<string[]>('GET', '/jobs/saved/ids'),
  },

  applications: {
    mine: () =>
      request<Array<{ id: string; status: string; job: JobSummary; createdAt: string }>>(
        'GET',
        '/applications/me',
      ),
    updateStatus: (id: string, status: string) =>
      request<{ id: string; status: string }>('PATCH', `/applications/${id}`, { body: { status } }),
    hire: (id: string, annualCtc: number, commissionRate: number) =>
      request<{ id: string }>('POST', `/applications/${id}/hire`, { body: { annualCtc, commissionRate } }),
  },

  talent: {
    search: (query: {
      search?: string;
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
    getBySlug: (slug: string) =>
      request<TalentDetail>('GET', `/talent/${encodeURIComponent(slug)}`),
    getPublicBySlug: (slug: string) =>
      request<TalentDetail>('GET', `/talent/public/${encodeURIComponent(slug)}`),
    myViewers: () => request<ProfileViewItem[]>('GET', '/talent/me/viewers'),
  },

  companies: {
    get: (id: string) => request<CompanyDetail>('GET', `/companies/${id}`),
    stats: (id: string) =>
      request<{
        activeJobs: number;
        newApplicationsThisWeek: number;
        shortlistedCount: number;
        hiresThisQuarter: number;
        commissionThisQuarter: number;
      }>('GET', `/companies/${id}/stats`),
    update: (id: string, dto: Partial<Pick<CompanyDetail, 'name' | 'logoUrl' | 'industry' | 'size' | 'website' | 'about' | 'perks' | 'culture' | 'incentiveStructure'> & { locations?: string[] }>) =>
      request<CompanyDetail>('PATCH', `/companies/${id}`, { body: dto }),
    reapply: (id: string) =>
      request<CompanyDetail>('POST', `/companies/${id}/reapply`),
  },

  shortlists: {
    list: (companyId: string) =>
      request<ShortlistSummary[]>('GET', '/shortlists', { query: { companyId } }),
    get: (id: string) => request<ShortlistDetail>('GET', `/shortlists/${id}`),
    create: (companyId: string, name: string) =>
      request<ShortlistSummary>('POST', '/shortlists', { body: { companyId, name } }),
    delete: (id: string) => request<void>('DELETE', `/shortlists/${id}`),
    addEntry: (id: string, salespersonId: string) =>
      request<{ id: string }>('POST', `/shortlists/${id}/entries`, { body: { salespersonId } }),
    removeEntry: (id: string, salespersonId: string) =>
      request<void>('DELETE', `/shortlists/${id}/entries/${salespersonId}`),
  },

  placements: {
    list: (query: { companyId: string; status?: string; page?: number; perPage?: number }) =>
      request<{ items: PlacementSummary[]; total: number; page: number; perPage: number }>(
        'GET', '/placements', { query },
      ),
    get: (id: string) => request<PlacementSummary>('GET', `/placements/${id}`),
  },

  invoices: {
    issue: (id: string) => request<{ id: string; status: string; issuedAt: string }>('POST', `/invoices/${id}/issue`),
    markPaid: (id: string) => request<{ id: string; status: string; paidAt: string }>('POST', `/invoices/${id}/mark-paid`),
    void: (id: string) => request<{ id: string; status: string }>('POST', `/invoices/${id}/void`),
  },

  leaderboards: {
    list: (query: { period?: 'daily' | 'weekly' | 'monthly' | 'all-time'; category?: string; limit?: number } = {}) =>
      request<{ entries: LeaderboardEntry[] }>('GET', '/leaderboards', {
        query: { period: query.period ?? 'all-time', category: query.category, limit: query.limit },
      }),
  },

  learning: {
    listTracks: () => request<LearningTrackSummary[]>('GET', '/learning/tracks'),
    getTrack: (id: string) => request<LearningTrackSummary & { tutorials: TutorialDetail[] }>('GET', `/learning/tracks/${id}`),
    getTutorial: (id: string) => request<TutorialDetail>('GET', `/learning/tutorials/${id}`),
    completeTutorial: (id: string) => request<TrackProgress>('POST', `/learning/tutorials/${id}/complete`),
    attemptQuiz: (id: string, answerIndices: number[]) =>
      request<{ attempt: { id: string; passed: boolean; score: number }; score: number; total: number; passed: boolean; rewardPointsAwarded: number }>(
        'POST', `/learning/quizzes/${id}/attempt`, { body: { answerIndices } },
      ),
    myProgress: () => request<TrackProgress[]>('GET', '/learning/me/progress'),
    createTrack: (dto: { title: string; description: string; category: string; order?: number }) =>
      request<LearningTrackSummary>('POST', '/learning/tracks', { body: dto }),
    updateTrack: (id: string, dto: { title?: string; description?: string; category?: string; order?: number }) =>
      request<LearningTrackSummary>('PATCH', `/learning/tracks/${id}`, { body: dto }),
    deleteTrack: (id: string) => request<void>('DELETE', `/learning/tracks/${id}`),
    createTutorial: (trackId: string, dto: { title: string; type: 'VIDEO' | 'ARTICLE'; contentUrl?: string; body?: string; order?: number }) =>
      request<TutorialDetail>('POST', `/learning/tracks/${trackId}/tutorials`, { body: dto }),
    updateTutorial: (id: string, dto: { title?: string; type?: 'VIDEO' | 'ARTICLE'; contentUrl?: string; body?: string; order?: number }) =>
      request<TutorialDetail>('PATCH', `/learning/tutorials/${id}`, { body: dto }),
    deleteTutorial: (id: string) => request<void>('DELETE', `/learning/tutorials/${id}`),
    upsertQuiz: (tutorialId: string, dto: { questions: Array<{ q: string; options: string[]; answerIndex: number }>; rewardPoints: number }) =>
      request<{ id: string; rewardPoints: number; questions: unknown }>('PUT', `/learning/tutorials/${tutorialId}/quiz`, { body: dto }),
    deleteQuiz: (tutorialId: string) => request<void>('DELETE', `/learning/tutorials/${tutorialId}/quiz`),
  },

  disputes: {
    create: (attemptId: string, reason: string) =>
      request<DisputeSummary>('POST', '/disputes', { body: { attemptId, reason } }),
    listMine: () => request<DisputeSummary[]>('GET', '/disputes/me'),
  },

  admin: {
    challenges: {
      list: (query: { status?: string; page?: number; perPage?: number } = {}) =>
        request<{ items: ChallengeSummary[]; total: number; page: number; perPage: number }>(
          'GET', '/challenges', { query: { ...query, perPage: query.perPage ?? 50 } },
        ),
      create: (dto: {
        title: string; brief: string; category: string;
        difficulty: string; goalType: string; goalDescription: string;
        basePoints: number; maxMessages: number; estimatedMinutes: number;
        attemptsAllowed?: number; personaId: string;
      }) => request<ChallengeSummary>('POST', '/challenges', { body: dto }),
      update: (id: string, dto: Partial<{
        title: string; brief: string; category: string;
        difficulty: string; goalType: string; goalDescription: string;
        basePoints: number; maxMessages: number; estimatedMinutes: number;
        attemptsAllowed?: number; personaId: string;
      }>) => request<ChallengeSummary>('PATCH', `/challenges/${id}`, { body: dto }),
      publish: (id: string) => request<ChallengeSummary>('POST', `/challenges/${id}/publish`),
      archive: (id: string) => request<ChallengeSummary>('POST', `/challenges/${id}/archive`),
    },
    personas: {
      list: () => request<Array<{ id: string; name: string; role: string; company: string; contextSnippet: string }>>('GET', '/personas'),
      create: (dto: { name: string; role: string; company: string; contextSnippet: string; personalityPrompt: string }) =>
        request<{ id: string; name: string; role: string; company: string; contextSnippet: string }>('POST', '/personas', { body: dto }),
      update: (id: string, dto: Partial<{ name: string; role: string; company: string; contextSnippet: string; personalityPrompt: string }>) =>
        request<{ id: string; name: string; role: string; company: string; contextSnippet: string }>('PATCH', `/personas/${id}`, { body: dto }),
    },
    audit: {
      list: (query: { entity?: string; actorId?: string; action?: string; page?: number; perPage?: number } = {}) =>
        request<{ items: AuditLogEntry[]; total: number; page: number; perPage: number }>(
          'GET', '/admin/audit', { query },
        ),
    },
    disputes: {
      list: (query: { status?: string; page?: number; perPage?: number } = {}) =>
        request<{ items: DisputeSummary[]; total: number; page: number; perPage: number }>(
          'GET', '/admin/disputes', { query },
        ),
      get: (id: string) => request<DisputeSummary>('GET', `/admin/disputes/${id}`),
      resolve: (id: string, resolution: string, status: 'RESOLVED' | 'REJECTED') =>
        request<DisputeSummary>('POST', `/admin/disputes/${id}/resolve`, { body: { resolution, status } }),
    },
    verification: {
      listPending: () => request<VerificationCompany[]>('GET', '/admin/verification/pending'),
      approve: (companyId: string, notes?: string) =>
        request<VerificationCompany>('POST', `/admin/verification/companies/${companyId}/approve`, { body: { notes } }),
      reject: (companyId: string, notes?: string) =>
        request<VerificationCompany>('POST', `/admin/verification/companies/${companyId}/reject`, { body: { notes } }),
    },
    config: {
      difficultyTiers: () => request<unknown[]>('GET', '/admin/config/difficulty-tiers'),
      updateTier: (tier: string, dto: Record<string, unknown>) =>
        request<unknown>('PATCH', `/admin/config/difficulty-tiers/${tier}`, { body: dto }),
      goalTypes: () => request<unknown[]>('GET', '/admin/config/goal-types'),
      updateGoal: (goalType: string, dto: Record<string, unknown>) =>
        request<unknown>('PATCH', `/admin/config/goal-types/${goalType}`, { body: dto }),
      ranks: () => request<unknown[]>('GET', '/admin/config/ranks'),
      updateRank: (rank: string, dto: Record<string, unknown>) =>
        request<unknown>('PATCH', `/admin/config/ranks/${rank}`, { body: dto }),
      scoringRules: () => request<unknown[]>('GET', '/admin/config/scoring-rules'),
      updateRule: (key: string, dto: Record<string, unknown>) =>
        request<unknown>('PATCH', `/admin/config/scoring-rules/${key}`, { body: dto }),
      rubricDimensions: () => request<unknown[]>('GET', '/admin/config/rubric-dimensions'),
      updateDimension: (id: string, dto: Record<string, unknown>) =>
        request<unknown>('PATCH', `/admin/config/rubric-dimensions/${id}`, { body: dto }),
    },
    stats: () =>
      request<{
        users: { salespersons: number; companies: number; admins: number };
        challenges: { total: number; published: number };
        attempts: { total: number; thisWeek: number; completedThisWeek: number };
      }>('GET', '/admin/stats'),
    users: (query: { role?: string; search?: string; page?: number; perPage?: number } = {}) =>
      request<{ items: AdminUser[]; total: number; page: number; perPage: number }>(
        'GET', '/admin/users', { query },
      ),
    updateUserRole: (id: string, role: string) =>
      request<{ id: string; role: string }>('PATCH', `/admin/users/${id}/role`, { body: { role } }),
  },

  notifications: {
    listMine: (unread?: boolean) =>
      request<{ items: NotificationItem[]; total: number; page: number; perPage: number }>(
        'GET', '/notifications/me', { query: { unread, perPage: 20 } },
      ),
    markRead: (id: string) => request<NotificationItem>('POST', `/notifications/${id}/read`),
    markAllRead: () => request<void>('POST', '/notifications/read-all'),
  },

  badges: {
    listDefinitions: () => request<BadgeDefinition[]>('GET', '/badges'),
    listEarned: () => request<EarnedBadge[]>('GET', '/badges/earned'),
    listEarnedForUser: (userId: string) => request<EarnedBadge[]>('GET', `/badges/user/${userId}`),
    createDefinition: (dto: { code: string; name: string; description: string; iconUrl?: string }) =>
      request<BadgeDefinition>('POST', '/badges/admin', { body: dto }),
    award: (badgeId: string, userId: string) =>
      request<EarnedBadge>('POST', `/badges/admin/${badgeId}/award`, { body: { userId } }),
    revoke: (badgeId: string, userId: string) =>
      request<{ success: boolean }>('DELETE', `/badges/admin/${badgeId}/revoke/${userId}`),
  },
};

export type Api = typeof api;
