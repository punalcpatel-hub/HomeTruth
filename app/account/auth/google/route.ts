import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await createClient('/account');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/account/auth/callback` },
  });

  if (error || !data.url) return NextResponse.redirect(`${origin}/signin?error=oauth`);
  return NextResponse.redirect(data.url);
}
