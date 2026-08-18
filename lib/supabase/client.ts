import { createBrowserClient } from '@supabase/ssr';

const url = 'https://nkntmdpvlxskbbopnvqg.supabase.co';
const publishableKey = 'sb_publishable_QWDJ-t_-JtZ9mQzmmIg4ng_UpPZvnvU';

export function createClient() {
  return createBrowserClient(url, publishableKey);
}
