import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Authentication exists only inside /account. Home and Search never execute
  // Supabase middleware, so signed-in state cannot alter public navigation.
  matcher: ['/account/:path*'],
};
