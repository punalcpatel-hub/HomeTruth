import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AccountPage() {
  const supabase = await createClient('/account');
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const email = typeof claims?.email === 'string' ? claims.email : null;

  return <main>
    <nav>
      <a href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></a>
      <div className="navlinks">
        <a href="/" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Home</a>
        <a href="/find-home" className="dark" style={{textDecoration:'none',padding:'11px 15px',display:'inline-block'}}>Search</a>
      </div>
    </nav>
    <section className="content" style={{maxWidth:760}}>
      <div className="eyebrow">YOUR HOMETRUTH ACCOUNT</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Account</h2>
      {claims ? <>
        <div className="notice">Signed in with Google</div>
        {email && <p style={{fontSize:18,marginTop:22}}>{email}</p>}
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:22}}>
          <a href="/find-home" className="darkButton" style={{display:'inline-block',textDecoration:'none'}}>Search homes</a>
          <form action="/account/auth/signout" method="post" style={{margin:0}}><button type="submit" className="outlineButton">Sign out</button></form>
        </div>
      </> : <>
        <p>You are not signed in. Sign in with Google to use account features.</p>
        <p style={{marginTop:22}}><a href="/signin" className="darkButton" style={{display:'inline-block',textDecoration:'none'}}>Sign in with Google</a></p>
      </>}
      <small style={{display:'block',marginTop:24,opacity:.55}}>Build: clean-find-home-v1</small>
    </section>
  </main>;
}
