import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/account', request.url), { status: 303 });

  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.startsWith('sb-')) continue;

    for (const path of ['/account', '/']) {
      response.cookies.set(cookie.name, '', {
        path,
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
        secure: true,
        httpOnly: true,
      });
    }
  }

  return response;
}
