import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const url = 'https://nkntmdpvlxskbbopnvqg.supabase.co';
const publishableKey = 'sb_publishable_QWDJ-t_-JtZ9mQzmmIg4ng_UpPZvnvU';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        }
      },
    },
  });

  // Refresh/validate once at the request boundary so Server Components do not
  // race each other while rotating a single-use refresh token.
  await supabase.auth.getClaims();

  return response;
}
