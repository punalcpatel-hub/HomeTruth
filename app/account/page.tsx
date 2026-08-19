'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type AccountUser = { email?: string } | null;

export default function AccountPage() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<AccountUser>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setMessage(error.message);
      setUser(data.session?.user ? { email: data.session.user.email } : null);
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

  return <main>
    <nav>
      <Link href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></Link>
      <div className="navlinks"><Link href="/search" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Search</Link></div>
    </nav>

    <section className="content" style={{maxWidth:760}}>
      <div className="eyebrow">YOUR HOMETRUTH ACCOUNT</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Account</h2>

      {loading ? <p>Checking your account...</p> : user ? <>
        <div className="notice">You are signed in.</div>
        <p style={{fontSize:18,marginTop:22}}>{user.email}</p>
        <button className="darkButton" type="button" onClick={()=>void signOut()}>Sign out</button>
      </> : <>
        <p>Sign in with Google to use saved homes and review features.</p>
        <button className="darkButton" type="button" onClick={()=>void signInWithGoogle()}>Continue with Google</button>
      </>}

      {message && <div className="flash">{message}</div>}
    </section>
  </main>;
}
