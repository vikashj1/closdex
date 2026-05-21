/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/* → NestJS whenever NEXT_PUBLIC_API_URL is not set.
  // Works in local dev AND on VPS when the web process runs on a different port to the API.
  // On Vercel (NEXT_PUBLIC_API_URL points to Railway/Render): browser calls that URL directly,
  // so this rewrite is skipped (returning [] means no proxy, no localhost:4000 on serverless).
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_URL) return [];
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
