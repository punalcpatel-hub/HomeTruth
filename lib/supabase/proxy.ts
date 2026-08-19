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
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Validate/refresh once at the request boundary.
  await supabase.auth.getClaims();
  return response;
}
