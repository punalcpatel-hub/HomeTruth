import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <main>
    <nav>
      <a href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></a>
      <div className="navlinks">
        <a href="/" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Home</a>
        <a href="/search" className="dark" style={{textDecoration:'none',padding:'11px 15px',display:'inline-block'}}>Search</a>
      </div>
    </nav>

    <section className="content" style={{maxWidth:760}}>
      <div className="eyebrow">YOUR HOMETRUTH ACCOUNT</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Account</h2>
      {user ? <>
        <div className="notice">Signed in with Google</div>
        <p style={{fontSize:18,marginTop:22}}>{user.email}</p>
        <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:22}}>
          <a href="/search" className="darkButton" style={{display:'inline-block',textDecoration:'none'}}>Search homes</a>
          <a href="/auth/signout" className="outlineButton" style={{display:'inline-block',textDecoration:'none'}}>Sign out</a>
        </div>
      </> : <>
        <p>You are not signed in. Sign in with Google to use account features.</p>
        <p style={{marginTop:22}}><a href="/signin" className="darkButton" style={{display:'inline-block',textDecoration:'none'}}>Sign in with Google</a></p>
      </>}
      <small style={{display:'block',marginTop:24,opacity:.55}}>Build: server-only-v1</small>
    </section>
  </main>;
}
