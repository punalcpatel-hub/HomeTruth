import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const supabase = await createClient('/account');

  try {
    await supabase.auth.signOut();
  } catch {
    // Cookie cleanup below is authoritative for the browser session.
  }

  const response = NextResponse.redirect(`${origin}/account`, { status: 303 });

  for (const cookie of request.cookies.getAll()) {
    if (!cookie.name.startsWith('sb-')) continue;

    response.cookies.set(cookie.name, '', {
      path: '/account',
      maxAge: 0,
      sameSite: 'lax',
      secure: true,
    });
    response.cookies.set(cookie.name, '', {
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
      secure: true,
    });
  }

  return response;
}
