export default function Home() {
  return <main>
    <nav>
      <div className="brand">Home<span>Truth</span></div>
      <div className="navlinks">
        <a href="/find-home" style={{textDecoration:'none',color:'inherit',padding:'11px 15px'}}>Search</a>
        <a href="/account" className="dark" style={{textDecoration:'none',padding:'11px 15px',display:'inline-block'}}>Account</a>
      </div>
    </nav>

    <section className="hero">
      <div className="eyebrow">PROPERTY REPUTATION, BUILT OVER TIME</div>
      <h1>Know the home <em>before</em><br/>you buy the home.</h1>
      <p>Real experiences from owners, tenants, buyers and sellers—attached to the property, not just the listing.</p>
      <div className="searchWrap">
        <form className="search" action="/find-home" method="get">
          <span>⌕</span>
          <input name="q" placeholder="3797 East Mead Dr, Chandler, AZ 85249" autoComplete="street-address" required/>
          <button type="submit">Search</button>
        </form>
      </div>
      <div className="trust">✓ Direct browser search &nbsp; · &nbsp; Auth-independent route &nbsp; · &nbsp; Persistent property history</div>
      <small style={{display:'block',marginTop:10,opacity:.55}}>Build: clean-find-home-v1</small>
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
