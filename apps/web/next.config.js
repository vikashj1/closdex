/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output bundles only what's needed — ideal for VPS/systemd deployment.
  // After build: copy public/ and .next/static/ into .next/standalone/, then run server.js.
  output: 'standalone',

  // Proxy /api/* → NestJS whenever NEXT_PUBLIC_API_URL is not set.
  // On VPS (no NEXT_PUBLIC_API_URL set): server-side rewrite → localhost:4000 works.
  // On Vercel (NEXT_PUBLIC_API_URL set to external API URL): browser calls that URL directly.
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
