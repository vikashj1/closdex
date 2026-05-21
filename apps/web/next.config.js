/** @type {import('next').NextConfig} */
const nextConfig = {
  // In dev, proxy /api/* → local NestJS so NEXT_PUBLIC_API_URL doesn't need to be set.
  // In production (VPS/Vercel) the reverse-proxy (Traefik/nginx) or NEXT_PUBLIC_API_URL handles routing.
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') ?? 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
