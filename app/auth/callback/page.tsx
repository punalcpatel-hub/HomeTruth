'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [message, setMessage] = useState('Finishing sign in...');

  useEffect(() => {
    let active = true;

    async function finishSignIn() {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        router.replace('/');
        return;
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return;
        if (session) router.replace('/');
      });

      window.setTimeout(() => {
        if (active) setMessage('Sign in was not completed. Please return home and try again.');
        listener.subscription.unsubscribe();
      }, 5000);
    }

    void finishSignIn();
    return () => { active = false; };
  }, [router, supabase]);

  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24}}><p>{message}</p></main>;
}
