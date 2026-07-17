import { NextRequest, NextResponse } from 'next/server';

// Beta gating: company + jobs + applications surfaces are hidden until the
// hiring side ships. Any request for them 302's to /coming-soon. Kept as
// middleware (not app-level redirects()) so the paths stay resolvable for
// future launch without a rebuild.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // /jobs itself is no longer gated — it now serves the logged-out hiring
  // pitch (marketing group) and redirects logged-in users to /coming-soon
  // client-side. Nested /jobs/:id detail pages stay gated until the board
  // ships.
  const gated =
    pathname === '/company' ||
    pathname.startsWith('/company/') ||
    pathname === '/for-companies' ||
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
  matcher: ['/company/:path*', '/for-companies', '/jobs/:path+', '/applications/:path*'],
};
