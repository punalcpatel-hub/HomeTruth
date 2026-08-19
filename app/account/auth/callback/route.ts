import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PRODUCTION_ORIGIN = 'https://home-truth-pearl.vercel.app';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${PRODUCTION_ORIGIN}/signin?error=missing_code`);
  }

  const supabase = await createClient('/account');
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${PRODUCTION_ORIGIN}/signin?error=callback`);
  }

  return NextResponse.redirect(`${PRODUCTION_ORIGIN}/account`);
}
