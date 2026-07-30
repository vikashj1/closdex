import type { MetadataRoute } from 'next';

/** Next.js 14 App Router serves this as /sitemap.xml at build time.
 *  Covers the public marketing surface — landing, product pages, and the
 *  logged-out browse views of challenges/leaderboard/learn/jobs. Protected
 *  app routes (dashboard, profile, admin) are deliberately excluded because
 *  they're auth-gated and blocked in robots.ts.
 *
 *  changeFrequency + priority are hints, not rules — search engines mostly
 *  ignore them but they don't hurt.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://closdex.com';
  const now = new Date();
  const pages: Array<{
    path: string;
    priority: number;
    changeFrequency: 'daily' | 'weekly' | 'monthly';
  }> = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/for-companies', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/challenges', priority: 0.8, changeFrequency: 'daily' },
    { path: '/leaderboard', priority: 0.8, changeFrequency: 'daily' },
    { path: '/jobs', priority: 0.8, changeFrequency: 'daily' },
    { path: '/learn', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/login', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/signup', priority: 0.5, changeFrequency: 'monthly' },
  ];
  return pages.map((p) => ({
    url: `${base}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
