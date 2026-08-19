'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState('Finishing sign in...');

  useEffect(() => {
    let active = true;

    async function finishSignIn() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        if (active) setMessage('Sign in code was missing. Please return home and try again.');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!active) return;

      if (error) {
        setMessage(error.message);
        return;
      }

      window.location.replace('/');
    }

    void finishSignIn();
    return () => { active = false; };
  }, [supabase]);

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24}}><p>{message}</p></main>;
}
