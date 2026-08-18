'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type AddressMatch = { address:string; city:string; state:string; zip:string; latitude:number|null; longitude:number|null };
type Property = { id:string; address:string; city:string; state:string; zip:string; score:number; summary:string };

export default function SearchPage() {
  const supabase = useMemo(() => createClient(), []);
  const [q,setQ] = useState('');
  const [matches,setMatches] = useState<AddressMatch[]>([]);
  const [status,setStatus] = useState('Enter an address to search.');
  const [working,setWorking] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search).get('q')?.trim() || '';
    setQ(query);
    if (!query) return;
    setStatus('Searching for that address...');
    let active = true;
    (async () => {
      try {
        const response = await fetch(`/api/address-search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (!active) return;
        const found = Array.isArray(data.matches) ? data.matches : [];
        setMatches(found);
        setStatus(found.length ? 'Choose the matching property below.' : 'No match found. Try a full address with city, state and ZIP.');
      } catch {
        if (active) setStatus('Address search could not connect. Try again.');
      }
    })();
    return () => { active = false; };
  },[]);

  async function openProperty(match:AddressMatch) {
    setWorking(true);
    setStatus('Opening property profile...');
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      sessionStorage.setItem('homeTruthPendingAddress', JSON.stringify(match));
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/search?q=${q}`)}` }
      });
      if (error) { setStatus(error.message); setWorking(false); }
      return;
    }

    const street = match.address.split(',')[0].trim();
    const { data: existing } = await supabase.from('properties').select('*').ilike('address',street).ilike('city',match.city).eq('state',match.state).eq('zip',match.zip).limit(1).maybeSingle();
    if (existing) {
      window.location.href = `/?property=${existing.id}`;
      return;
    }

    const { data: created, error } = await supabase.from('properties').insert({
      address: street,
      city: match.city,
      state: match.state,
      zip: match.zip,
      latitude: match.latitude,
      longitude: match.longitude,
      score: 0,
      summary: 'New HomeTruth profile. Property details and community experiences will be added over time.'
    }).select('*').single();

    if (error) {
      setStatus(error.message);
      setWorking(false);
      return;
    }

    window.location.href = `/?property=${(created as Property).id}`;
  }

  return <main>
    <nav><Link href="/" className="brand" style={{textDecoration:'none',color:'inherit'}}>Home<span>Truth</span></Link></nav>
    <section className="content" style={{maxWidth:900}}>
      <div className="eyebrow">PROPERTY SEARCH</div>
      <h2 style={{font:'700 42px/1 Georgia,serif',margin:'0 0 20px'}}>Search results</h2>
      <form action="/search" method="get" className="search" style={{maxWidth:'100%',marginBottom:24}}>
        <span>⌕</span><input name="q" defaultValue={q} placeholder="123 Main St, Phoenix, AZ 85004" required/><button type="submit">Search</button>
      </form>
      <div className="notice">{status}</div>
      <div style={{display:'grid',gap:12,marginTop:20}}>
        {matches.map((m,i)=><button key={`${m.address}-${i}`} className="agent" style={{width:'100%',textAlign:'left'}} onClick={()=>void openProperty(m)} disabled={working}>
          <div><h3>{m.address}</h3><p>{m.city}, {m.state} {m.zip}</p></div><div className="agentScore">{working?'Opening...':'Open profile →'}</div>
        </button>)}
      </div>
    </section>
  </main>;
}
