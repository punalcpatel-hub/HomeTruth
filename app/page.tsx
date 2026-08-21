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

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const property = q ? parseAddress(q) : null;
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local';

  return <main>
    <nav>
      <div className="brand">Home<span>Truth</span></div>
      <div className="navlinks">
        <a href="/#home-search" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Search</a>
        <a href="/account" className="dark" style={{textDecoration:'none',padding:'11px 15px',display:'inline-block'}}>Account</a>
      </div>
    </nav>

    <section className="hero" id="home-search">
      <div className="eyebrow">PROPERTY REPUTATION, BUILT OVER TIME</div>
      <h1>Know the home <em>before</em><br/>you buy the home.</h1>
      <p>Search directly on this page. No separate Search route, auth middleware, or client-side handler is involved.</p>
      <div className="searchWrap">
        <form className="search" action="/" method="get">
          <span>⌕</span>
          <input name="q" defaultValue={q} placeholder="3797 East Mead Dr, Chandler, AZ 85249" autoComplete="street-address" required/>
          <button type="submit">Search</button>
        </form>
      </div>

      {q && !property && <div className="notice">Search received. Please enter street, city, state and ZIP.</div>}
      {property && <article className="agent" style={{marginTop:20,maxWidth:760}}>
        <div><h3>{property.address}</h3><p>{property.city}, {property.state} {property.zip}</p><p>HomeTruth profile loaded.</p></div>
        <div className="agentScore">Found</div>
      </article>}

      <div className="trust">✓ Native browser GET &nbsp; · &nbsp; Same-page result &nbsp; · &nbsp; No Search middleware</div>
      <small style={{display:'block',marginTop:10,opacity:.55}}>Build: homepage-search-v1 · {commit}</small>
    </section>

    <section className="how">
      <div className="eyebrow">WHY HOMETRUTH</div>
      <h2>A permanent reputation layer for real estate.</h2>
      <div className="steps">
        <div><b>01</b><h3>Search any home</h3><p>Find a persistent profile tied to a real U.S. address.</p></div>
        <div><b>02</b><h3>Learn from residents</h3><p>See structured feedback on the property experience.</p></div>
        <div><b>03</b><h3>Save and review</h3><p>Use your account for saved homes and verified reviews.</p></div>
      </div>
    </section>

    <footer><div className="brand">Home<span>Truth</span></div><p>Every home has a history. We make it visible.</p></footer>
  </main>;
}
