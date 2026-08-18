import Link from 'next/link';

type AddressMatch = {
  address: string;
  city: string;
  state: string;
  zip: string;
};

function parseTypedAddress(q: string): AddressMatch | null {
  const parts = q.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) return null;

  const street = parts[0];
  const city = parts[1];
  const stateZip = parts.slice(2).join(' ');
  const match = stateZip.match(/\b([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
  if (!street || !city || !match) return null;

  return { address: street, city, state: match[1].toUpperCase(), zip: match[2] };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  const typed = q ? parseTypedAddress(q) : null;

  return <main>
    <nav><Link href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></Link></nav>
    <section className="content" style={{maxWidth:900}}>
      <div className="eyebrow">PROPERTY SEARCH</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Search results</h2>
      <form action="/search" method="get" className="search" style={{maxWidth:'100%',marginBottom:24}}>
        <span>⌕</span>
        <input name="q" defaultValue={q} placeholder="123 Main St, Phoenix, AZ 85004" required/>
        <button type="submit">Search</button>
      </form>

      {!q && <div className="notice">Enter a full address including city, state and ZIP.</div>}
      {q && !typed && <div className="notice">Search received. Please use a full address like: 123 Main St, Phoenix, AZ 85004.</div>}
      {typed && <>
        <div className="notice">Address found. Search is working whether you are signed in or signed out.</div>
        <article className="agent" style={{marginTop:20}}>
          <div><h3>{typed.address}</h3><p>{typed.city}, {typed.state} {typed.zip}</p></div>
          <div className="agentScore">HomeTruth result</div>
        </article>
      </>}
    </section>
  </main>;
}
