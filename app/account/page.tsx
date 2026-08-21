import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ParsedAddress = { address: string; city: string; state: string; zip: string };

function parseAddress(input: string): ParsedAddress | null {
  const parts = input.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  const address = parts[0];
  const city = parts[1];
  const match = parts.slice(2).join(' ').match(/\b([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
  if (!address || !city || !match) return null;
  return { address, city, state: match[1].toUpperCase(), zip: match[2] };
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const cookieStore = await cookies();
  const isSignedIn = cookieStore.getAll().some((cookie) =>
    cookie.name.startsWith('sb-') && cookie.name.includes('auth-token') && cookie.value.length > 20
  );
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const property = q ? parseAddress(q) : null;

  return <main>
    <nav>
      <a href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></a>
      <div className="navlinks">
        <a href="#account-search" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Search</a>
        <a href="/" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Home</a>
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

      <div id="account-search" style={{marginTop:36}}>
        <div className="eyebrow">SEARCH HOMES</div>
        <form action="/account" method="get" className="search" style={{maxWidth:'100%',marginBottom:24}}>
          <span>⌕</span>
          <input name="q" defaultValue={q} placeholder="3797 East Mead Dr, Chandler, AZ 85249" autoComplete="street-address" required/>
          <button type="submit">Search</button>
        </form>

        {!q && <div className="notice">Enter a complete U.S. street address.</div>}
        {q && !property && <div className="notice">Search received. Please include street, city, state and ZIP.</div>}
        {property && <article className="agent" style={{marginTop:20}}>
          <div>
            <h3>{property.address}</h3>
            <p>{property.city}, {property.state} {property.zip}</p>
            <p>HomeTruth search loaded independently of account authentication.</p>
          </div>
          <div className="agentScore">Found</div>
        </article>}
      </div>

      <small style={{display:'block',marginTop:24,opacity:.55}}>Build: auth-search-decoupled-v1</small>
    </section>
  </main>;
}
