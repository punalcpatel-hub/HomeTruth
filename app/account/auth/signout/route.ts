import { NextRequest, NextResponse } from 'next/server';

function signOut(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/account?signedout=1', request.url), { status: 303 });

  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.startsWith('sb-')) continue;

    response.cookies.set(cookie.name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      sameSite: 'lax',
      secure: true,
    });

    response.cookies.set(cookie.name, '', {
      path: '/account',
      maxAge: 0,
      expires: new Date(0),
      sameSite: 'lax',
      secure: true,
    });
  }

  response.headers.set('Clear-Site-Data', '"cookies"');
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}

export async function GET(request: NextRequest) {
  return signOut(request);
}

export async function POST(request: NextRequest) {
  return signOut(request);
}
