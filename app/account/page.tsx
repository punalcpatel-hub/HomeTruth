import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HOME = 'https://home-truth-pearl.vercel.app/';
const SEARCH = 'https://home-truth-pearl.vercel.app/#home-search';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const isSignedIn = cookieStore.getAll().some((cookie) =>
    cookie.name.startsWith('sb-') && cookie.name.includes('auth-token') && cookie.value.length > 20
  );

  return <main>
    <nav>
      <a href={HOME} className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></a>
      <div className="navlinks">
        <a href={SEARCH} className="dark" style={{textDecoration:'none',padding:'11px 15px',display:'inline-block'}}>Search Homes</a>
        <a href="/account" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Account</a>
      </div>
    </nav>

    <section className="content" style={{maxWidth:900}}>
      <div className="eyebrow">YOUR HOMETRUTH ACCOUNT</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Account</h2>

      {isSignedIn ? <>
        <div className="notice">Signed in with Google</div>
        <p style={{marginTop:18}}><a href="/account/auth/signout" className="outlineButton" style={{display:'inline-block',textDecoration:'none'}}>Sign out</a></p>
      </> : <>
        <div className="notice">You are not signed in.</div>
        <p style={{marginTop:18}}><a href="/account/auth/google" className="darkButton" style={{display:'inline-block',textDecoration:'none'}}>Sign in with Google</a></p>
      </>}

      <div style={{marginTop:34,paddingTop:28,borderTop:'1px solid #d9d5ca'}}>
        <div className="eyebrow">PROPERTY SEARCH</div>
        <p>Property search opens the public HomeTruth search page directly.</p>
        <p style={{marginTop:18}}><a href={SEARCH} className="darkButton" style={{display:'inline-block',textDecoration:'none'}}>Open Search Homes</a></p>
      </div>

      <small style={{display:'block',marginTop:24,opacity:.55}}>Build: absolute-search-link-v1</small>
    </section>
  </main>;
}
