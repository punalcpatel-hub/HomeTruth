import { createClient } from '@/lib/supabase/server';

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
  const supabase = await createClient('/account');
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;
  const email = typeof claims?.email === 'string' ? claims.email : null;
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const property = q ? parseAddress(q) : null;

  return <main>
    <nav>
      <a href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></a>
      <div className="navlinks">
        <a href="/" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Home</a>
        <a href="#account-search" className="dark" style={{textDecoration:'none',padding:'11px 15px',display:'inline-block'}}>Search</a>
      </div>
    </nav>

    <section className="content" style={{maxWidth:900}}>
      <div className="eyebrow">YOUR HOMETRUTH ACCOUNT</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Account</h2>

      {claims ? <>
        <div className="notice">Signed in with Google</div>
        {email && <p style={{fontSize:18,marginTop:22}}>{email}</p>}

        <div id="account-search" style={{marginTop:32}}>
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
              <p>Signed-in HomeTruth search loaded directly inside Account.</p>
            </div>
            <div className="agentScore">Found</div>
          </article>}
        </div>

        <form action="/account/auth/signout" method="post" style={{marginTop:28}}>
          <button type="submit" className="outlineButton">Sign out</button>
        </form>
      </> : <>
        <p>You are not signed in. Sign in with Google to use account features.</p>
        <p style={{marginTop:22}}><a href="/signin" className="darkButton" style={{display:'inline-block',textDecoration:'none'}}>Sign in with Google</a></p>
      </>}

      <small style={{display:'block',marginTop:24,opacity:.55}}>Build: inline-account-search-v1</small>
    </section>
  </main>;
}
