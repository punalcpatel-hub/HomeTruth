export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ParsedAddress = {
  address: string;
  city: string;
  state: string;
  zip: string;
};

function parseAddress(input: string): ParsedAddress | null {
  const parts = input.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) return null;

  const address = parts[0];
  const city = parts[1];
  const stateZip = parts.slice(2).join(' ');
  const match = stateZip.match(/\b([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
  if (!address || !city || !match) return null;

  return {
    address,
    city,
    state: match[1].toUpperCase(),
    zip: match[2],
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const property = q ? parseAddress(q) : null;

  console.info('[HomeTruth search]', { hasQuery: Boolean(q), parsed: Boolean(property) });

  return <main>
    <nav>
      <a href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></a>
      <div className="navlinks"><a href="/account" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Account</a></div>
    </nav>

    <section className="content" style={{maxWidth:900}}>
      <div className="eyebrow">NATIONWIDE PROPERTY SEARCH</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Search any U.S. home</h2>
      <p style={{marginBottom:24}}>Address navigation now renders immediately. Property-data enrichment will load separately so it can never block Search.</p>

      <form action="/search" method="GET" className="search" style={{maxWidth:'100%',marginBottom:24}}>
        <span>⌕</span>
        <input name="q" defaultValue={q} placeholder="3797 East Mead Dr, Chandler, AZ 85249" autoComplete="street-address" required/>
        <button type="submit">Search</button>
      </form>

      {!q && <div className="notice">Enter a complete U.S. street address.</div>}
      {q && !property && <div className="notice">Search received. Please use a full address like: 3797 East Mead Dr, Chandler, AZ 85249.</div>}
      {property && <>
        <div className="notice">Address loaded successfully.</div>
        <article className="agent" style={{marginTop:20,alignItems:'flex-start'}}>
          <div style={{flex:1}}>
            <h3>{property.address}</h3>
            <p>{property.city}, {property.state} {property.zip}</p>
            <p style={{marginTop:14}}>HomeTruth property profile ready for enrichment.</p>
          </div>
          <div className="agentScore">HomeTruth profile</div>
        </article>
      </>}

      <small style={{display:'block',marginTop:24,opacity:.55}}>Build: instant-search-v1</small>
    </section>
  </main>;
}
