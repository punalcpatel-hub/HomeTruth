import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const supabase = await createClient('/account');
  await supabase.auth.signOut();
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
