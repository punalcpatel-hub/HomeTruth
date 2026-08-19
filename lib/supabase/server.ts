import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = 'https://nkntmdpvlxskbbopnvqg.supabase.co';
const publishableKey = 'sb_publishable_QWDJ-t_-JtZ9mQzmmIg4ng_UpPZvnvU';

export async function createClient(cookiePath = '/') {
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    cookieOptions: {
      path: cookiePath,
      sameSite: 'lax',
      secure: true,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              path: cookiePath,
              sameSite: 'lax',
              secure: true,
            });
          });
        } catch {
          // Server Components cannot always write cookies. Route handlers can.
        }
      },
    },
  });
}
