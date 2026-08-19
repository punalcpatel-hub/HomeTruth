import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PRODUCTION_ORIGIN = 'https://home-truth-pearl.vercel.app';

export async function GET() {
  const supabase = await createClient('/account');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${PRODUCTION_ORIGIN}/account/auth/callback` },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${PRODUCTION_ORIGIN}/signin?error=oauth`);
  }

  return NextResponse.redirect(data.url);
}
