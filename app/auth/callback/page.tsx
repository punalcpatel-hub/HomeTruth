'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState('Finishing sign in...');

  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    function getNextPath() {
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      if (next && next.startsWith('/')) return next;
      return '/';
    }

    function finishRedirect() {
      window.location.replace(getNextPath());
    }

    async function finishSignIn() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        finishRedirect();
        return;
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        if (session) {
          window.setTimeout(finishRedirect, 0);
        }
      });

      timer = window.setTimeout(() => {
        if (active) setMessage('Sign in was not completed. Please return home and try again.');
        listener.subscription.unsubscribe();
      }, 5000);
    }

    void finishSignIn();
    return () => {
      active = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [supabase]);

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24}}><p>{message}</p></main>;
}
