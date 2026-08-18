'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Property = { id:string; address:string; city:string; state:string; zip:string; beds:number|null; baths:number|null; sqft:number|null; year_built:number|null; score:number; summary:string };
type Agent = { id:string; full_name:string; brokerage:string|null; state:string|null; license_number:string|null };

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [properties,setProperties] = useState<Property[]>([]);
  const [agents,setAgents] = useState<Agent[]>([]);
  const [query,setQuery] = useState('');
  const [selected,setSelected] = useState<Property|null>(null);
  const [tab,setTab] = useState<'homes'|'agents'>('homes');
  const [loading,setLoading] = useState(true);

  useEffect(() => { (async () => {
    const [{data:p},{data:a}] = await Promise.all([
      supabase.from('properties').select('*').order('score',{ascending:false}),
      supabase.from('agents').select('*').order('full_name')
    ]);
    setProperties((p||[]) as Property[]); setAgents((a||[]) as Agent[]); setLoading(false);
  })(); },[supabase]);

  const filtered = properties.filter(p => `${p.address} ${p.city} ${p.state} ${p.zip}`.toLowerCase().includes(query.toLowerCase()));

  return <main>
    <nav><div className="brand">Home<span>Truth</span></div><div className="navlinks"><button onClick={()=>setTab('homes')}>Homes</button><button onClick={()=>setTab('agents')}>Realtors</button><button className="dark">Sign in</button></div></nav>
    <section className="hero"><div className="eyebrow">PROPERTY REPUTATION, BUILT OVER TIME</div><h1>Know the home <em>before</em><br/>you buy the home.</h1><p>Real experiences from owners, tenants, buyers and sellers—attached to the property, not just the listing.</p><div className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} onFocus={()=>setTab('homes')} placeholder="Search an address in Phoenix..."/><button onClick={()=>setTab('homes')}>Search</button></div><div className="trust">✓ Verified experiences &nbsp; · &nbsp; Persistent property history &nbsp; · &nbsp; Realtor accountability</div></section>

    {tab==='homes' ? <section className="content"><div className="sectionHead"><div><div className="eyebrow">LIVE FROM SUPABASE</div><h2>Explore homes</h2></div><p>{properties.length} property profiles</p></div>{loading?<p>Loading properties…</p>:<div className="grid">{filtered.map(p=><article className="card" key={p.id} onClick={()=>setSelected(p)}><div className="photo"><div className="score">★ {Number(p.score).toFixed(1)}</div><div className="house">⌂</div></div><div className="cardbody"><h3>{p.address}</h3><p>{p.city}, {p.state} {p.zip}</p><div className="facts"><b>{p.beds ?? '—'}</b> beds <b>{p.baths ?? '—'}</b> baths <b>{p.sqft?.toLocaleString() ?? '—'}</b> sqft</div><p className="summary">{p.summary}</p><button className="link">View property profile →</button></div></article>)}</div>}</section>:
    <section className="content"><div className="sectionHead"><div><div className="eyebrow">PROFESSIONAL REPUTATION</div><h2>Realtor profiles</h2></div><p>{agents.length} profiles</p></div><div className="agentGrid">{agents.map(a=><article className="agent" key={a.id}><div className="avatar">{a.full_name.split(' ').map(x=>x[0]).join('')}</div><div><h3>{a.full_name}</h3><p>{a.brokerage}</p><small>{a.state} license · {a.license_number}</small></div><div className="agentScore">★ New</div></article>)}</div></section>}

    <section className="how"><div className="eyebrow">WHY HOMETRUTH</div><h2>A permanent reputation layer for real estate.</h2><div className="steps"><div><b>01</b><h3>Search any home</h3><p>Find a persistent profile tied to the property—not a temporary listing.</p></div><div><b>02</b><h3>Learn from residents</h3><p>See structured feedback on noise, maintenance, build quality, parking and HOA experience.</p></div><div><b>03</b><h3>Review the transaction</h3><p>Verified buyers and sellers can also review the real estate professionals involved.</p></div></div></section>

    {selected && <div className="modal" onClick={()=>setSelected(null)}><div className="panel" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><div className="eyebrow">PROPERTY PROFILE</div><h2>{selected.address}</h2><p>{selected.city}, {selected.state} {selected.zip}</p><div className="bigscore">★ {Number(selected.score).toFixed(1)} <small>Home Score</small></div><div className="profileFacts"><span><b>{selected.beds}</b> beds</span><span><b>{selected.baths}</b> baths</span><span><b>{selected.sqft?.toLocaleString()}</b> sqft</span><span><b>{selected.year_built}</b> built</span></div><p>{selected.summary}</p><div className="notice">Review submission and verified-user workflows are the next live feature being connected.</div></div></div>}
    <footer><div className="brand">Home<span>Truth</span></div><p>Every home has a history. We make it visible.</p></footer>
  </main>;
}
