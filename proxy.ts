import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Keep /search completely outside Supabase auth processing. Auth refreshes
  // everywhere else so a signed-in session stays healthy without touching search.
  matcher: ['/((?!search(?:/|$)|_next/static|_next/image|favicon.ico).*)'],
};
