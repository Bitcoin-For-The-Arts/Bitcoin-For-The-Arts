import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function getEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function isArtistHubAssetPath(pathname: string): boolean {
  if (pathname.startsWith('/artist-hub/_app/')) return true;
  if (pathname.startsWith('/artist-hub/assets/')) return true;
  const last = pathname.split('/').pop() || '';
  return last.includes('.');
}

function unauthorized() {
  return new NextResponse('Authentication required.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="BFTA Admin"' },
  });
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Serve the SvelteKit SPA from /public/artist-hub (deep-link safe).
  if (pathname.startsWith('/artist-hub') && !isArtistHubAssetPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/artist-hub/index.html';
    return NextResponse.rewrite(url);
  }

  const needsAuth =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/grants/files');
  if (!needsAuth) return NextResponse.next();

  const user = getEnv('ADMIN_USER');
  const pass = getEnv('ADMIN_PASS');

  // If admin creds aren't configured, hide the route.
  if (!user || !pass) return new NextResponse('Not found.', { status: 404 });

  const auth = req.headers.get('authorization');
  if (!auth || !auth.toLowerCase().startsWith('basic ')) return unauthorized();

  const encoded = auth.slice('basic '.length);
  let decoded = '';
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8');
  } catch {
    return unauthorized();
  }

  const idx = decoded.indexOf(':');
  if (idx < 0) return unauthorized();
  const u = decoded.slice(0, idx);
  const p = decoded.slice(idx + 1);

  if (u !== user || p !== pass) return unauthorized();

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/artist-hub/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/grants/files/:path*',
  ],
};

