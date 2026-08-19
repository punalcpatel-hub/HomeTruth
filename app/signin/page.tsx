export default function SignInPage() {
  return <main>
    <nav><a href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></a></nav>
    <section className="content" style={{maxWidth:760}}>
      <div className="eyebrow">SIGN IN</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Continue with Google</h2>
      <p>Google authentication is isolated to your Account area so it cannot interfere with HomeTruth Search.</p>
      <a className="darkButton" href="/account/auth/google" style={{display:'inline-block',textDecoration:'none'}}>Continue with Google</a>
      <small style={{display:'block',marginTop:24,opacity:.55}}>Build: account-scoped-auth-v1</small>
    </section>
  </main>;
}
