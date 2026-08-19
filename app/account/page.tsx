import AccountClient from './AccountClient';

export default function AccountPage() {
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
      <AccountClient />
      <small style={{display:'block',marginTop:24,opacity:.55}}>Build: account-static-nav-v1</small>
    </section>
  </main>;
}
