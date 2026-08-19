import { lookupProperty } from '@/lib/property/providers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim() : '';
  const property = q ? await lookupProperty(q) : null;

  return <main>
    <nav>
      <a href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></a>
      <div className="navlinks"><a href="/account" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Account</a></div>
    </nav>

    <section className="content" style={{maxWidth:900}}>
      <div className="eyebrow">NATIONWIDE PROPERTY SEARCH</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Search any U.S. home</h2>
      <p style={{marginBottom:24}}>Search on-market or off-market residential addresses. HomeTruth checks nationwide property and address sources.</p>

      <form action="/search" method="GET" className="search" style={{maxWidth:'100%',marginBottom:24}}>
        <span>⌕</span>
        <input name="q" defaultValue={q} placeholder="3797 East Mead Dr, Chandler, AZ 85249" autoComplete="street-address" required/>
        <button type="submit">Search</button>
      </form>

      {!q && <div className="notice">Enter a complete U.S. street address.</div>}
      {q && !property && <div className="notice">We could not verify that address yet. Check the spelling and include city, state and ZIP.</div>}
      {property && <>
        <div className="notice">Verified address · Source: {property.source.toUpperCase()}</div>
        <article className="agent" style={{marginTop:20,alignItems:'flex-start'}}>
          <div style={{flex:1}}>
            <h3>{property.address}</h3>
            <p>{property.city}, {property.state} {property.zip}</p>
            <div className="profileFacts" style={{marginTop:18}}>
              {property.beds != null && <span><b>{property.beds}</b> beds</span>}
              {property.baths != null && <span><b>{property.baths}</b> baths</span>}
              {property.sqft != null && <span><b>{property.sqft.toLocaleString()}</b> sqft</span>}
              {property.yearBuilt != null && <span><b>{property.yearBuilt}</b> built</span>}
            </div>
            {property.propertyType && <p style={{marginTop:14}}>Property type: {property.propertyType}</p>}
            {property.parcelNumber && <small>Parcel/APN: {property.parcelNumber}</small>}
          </div>
          <div className="agentScore">HomeTruth profile</div>
        </article>
      </>}

      <small style={{display:'block',marginTop:24,opacity:.55}}>Build: nationwide-search-v1</small>
    </section>
  </main>;
}
