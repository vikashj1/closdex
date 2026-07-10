import { NextRequest, NextResponse } from 'next/server';

// Beta gating: company + jobs + applications surfaces are hidden until the
// hiring side ships. Any request for them 302's to /coming-soon. Kept as
// middleware (not app-level redirects()) so the paths stay resolvable for
// future launch without a rebuild.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const gated =
    pathname === '/company' ||
    pathname.startsWith('/company/') ||
    pathname === '/for-companies' ||
    pathname === '/jobs' ||
    pathname.startsWith('/jobs/') ||
    pathname === '/applications' ||
    pathname.startsWith('/applications/');
  if (!gated) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = '/coming-soon';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/company/:path*', '/for-companies', '/jobs/:path*', '/applications/:path*'],
};
