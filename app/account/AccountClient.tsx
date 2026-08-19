'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type AccountUser = { email?: string } | null;

export default function AccountClient() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<AccountUser>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setUser(null);
        setMessage(error.message);
      } else {
        setUser(data.user ? { email: data.user.email } : null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ? { email: session.user.email } : null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function signInWithGoogle() {
    setMessage('Opening Google sign in...');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/account` },
    });
    if (error) setMessage(error.message);
  }

  async function signOut() {
    setMessage('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage(error.message);
      return;
    }
    setUser(null);
    setMessage('Signed out.');
  }

  if (loading) return <p>Checking your account...</p>;

  return <>
    {user ? <>
      <div className="notice">You are signed in.</div>
      <p style={{fontSize:18,marginTop:22}}>{user.email}</p>
      <button className="darkButton" type="button" onClick={()=>void signOut()}>Sign out</button>
    </> : <>
      <p>Sign in with Google to use saved homes and review features.</p>
      <button className="darkButton" type="button" onClick={()=>void signInWithGoogle()}>Continue with Google</button>
    </>}
    {message && <div className="flash">{message}</div>}
  </>;
}
