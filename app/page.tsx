import HomeClient from './HomeClient';

export default function Home() {
  return <main>
    <nav>
      <div className="brand">Home<span>Truth</span></div>
    </nav>
    <section className="hero">
      <div className="eyebrow">PROPERTY REPUTATION, BUILT OVER TIME</div>
      <h1>Know the home <em>before</em><br/>you buy the home.</h1>
      <p>Real experiences from owners, tenants, buyers and sellers—attached to the property, not just the listing.</p>
      <div className="searchWrap">
        <form className="search" action="/search" method="get">
          <span>⌕</span>
          <input name="q" placeholder="Search a U.S. street address..." required/>
          <button type="submit">Search</button>
        </form>
      </div>
      <p style={{marginTop:12}}>
        <a href="/search" className="darkButton" style={{display:'inline-block',textDecoration:'none'}}>Open search page</a>
      </p>
      <div className="trust">✓ Real U.S. address lookup &nbsp; · &nbsp; Persistent property history &nbsp; · &nbsp; Realtor accountability</div>
      <small style={{display:'block',marginTop:10,opacity:.55}}>Build: direct-search-v1</small>
    </section>
    <HomeClient />
  </main>;
}
