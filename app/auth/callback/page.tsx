'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState('Finishing sign in...');

  useEffect(() => {
    let active = true;

    async function finishSignIn() {
      // Give supabase-js one event-loop turn to process OAuth tokens from the URL.
      await new Promise(resolve => window.setTimeout(resolve, 0));

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data.session) {
        setMessage('Sign in was not completed. Please return home and try again.');
        return;
      }

      // Always leave the auth page with a brand-new document load.
      window.location.href = '/';
    }

    void finishSignIn();
    return () => { active = false; };
  }, [supabase]);

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24}}><p>{message}</p></main>;
}
