import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PRODUCTION_ORIGIN = 'https://home-truth-pearl.vercel.app';

function clearLegacyRootCookies(request: NextRequest, response: NextResponse) {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.set(cookie.name, '', {
        path: '/',
        maxAge: 0,
        sameSite: 'lax',
        secure: true,
      });
    }
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(`${PRODUCTION_ORIGIN}/signin?error=missing_code`);

  const supabase = await createClient('/account');
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  const response = NextResponse.redirect(
    error ? `${PRODUCTION_ORIGIN}/signin?error=callback` : `${PRODUCTION_ORIGIN}/account`
  );

  clearLegacyRootCookies(request, response);
  return response;
}
