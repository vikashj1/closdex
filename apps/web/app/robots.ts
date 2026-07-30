import type { MetadataRoute } from 'next';

/** Next.js 14 App Router serves this as /robots.txt at build time.
 *
 *  Strategy (2026-07-30, Vikash SEO/AEO push):
 *  - Explicitly allow both classic search bots (Google, Bing, DuckDuckBot)
 *    and named AI answer-engine bots (GPTBot, ChatGPT-User, OAI-SearchBot,
 *    ClaudeBot, PerplexityBot, Google-Extended). Opting AI bots in by name
 *    is the AEO signal — an unspecified robots.txt makes many of them skip.
 *  - Disallow authenticated app routes so bots don't waste crawl budget on
 *    login-walled dashboards + admin.
 *  - Sitemap link so crawlers can discover every public page in one hit
 *    without following internal links.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/company/', '/dashboard', '/profile', '/settings', '/play/', '/notifications', '/attempts/', '/onboarding'],
      },
      // Answer-engine crawlers — explicit allow tells them we welcome citations.
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
    ],
    sitemap: 'https://closdex.com/sitemap.xml',
    host: 'https://closdex.com',
  };
}
