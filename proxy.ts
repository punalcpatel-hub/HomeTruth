import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

function scrubSearchCookies(request: NextRequest) {
  const legacyNames = request.cookies
    .getAll()
    .filter((cookie) => cookie.name.startsWith('sb-'))
    .map((cookie) => cookie.name);

  for (const name of legacyNames) {
    request.cookies.delete(name);
  }

  const response = NextResponse.next({ request });

  for (const name of legacyNames) {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
      secure: true,
    });
  }

  response.headers.set('x-hometruth-search-scrubbed', String(legacyNames.length));
  return response;
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/search' || request.nextUrl.pathname.startsWith('/search/')) {
    return scrubSearchCookies(request);
  }

  return updateSession(request);
}

export const config = {
  matcher: ['/account/:path*', '/search/:path*'],
};
