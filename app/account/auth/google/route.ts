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
  const supabase = await createClient('/account');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${PRODUCTION_ORIGIN}/account/auth/callback` },
  });

  const response = NextResponse.redirect(
    error || !data.url ? `${PRODUCTION_ORIGIN}/signin?error=oauth` : data.url
  );

  clearLegacyRootCookies(request, response);
  return response;
}
