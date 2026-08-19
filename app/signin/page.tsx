'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const supabase = useMemo(() => createClient(), []);
  const [message,setMessage] = useState('');

  async function signIn() {
    setMessage('Opening Google sign in...');
    const {error} = await supabase.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:`${window.location.origin}/auth/callback?next=/`}
    });
    if(error) setMessage(error.message);
  }

  return <main>
    <nav><a href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></a></nav>
    <section className="content" style={{maxWidth:760}}>
      <div className="eyebrow">SIGN IN</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Continue with Google</h2>
      <p>Sign in, then you’ll return to the static HomeTruth homepage where Search remains independent of authentication.</p>
      <button className="darkButton" type="button" onClick={()=>void signIn()}>Continue with Google</button>
      {message&&<div className="flash">{message}</div>}
    </section>
  </main>;
}
