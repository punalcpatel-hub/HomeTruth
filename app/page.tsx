'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Property = { id:string; address:string; city:string; state:string; zip:string; beds:number|null; baths:number|null; sqft:number|null; year_built:number|null; score:number; summary:string };
type Agent = { id:string; full_name:string; brokerage:string|null; state:string|null; license_number:string|null };
type Review = { id:string; property_id:string; relationship:string; overall_rating:number; review_text:string; verification_status:string; created_at:string };
type SessionUser = { id:string; email?:string } | null;

export default function Home() {
  const supabase = useMemo(() => createClient(), []);
  const [properties,setProperties] = useState<Property[]>([]);
  const [agents,setAgents] = useState<Agent[]>([]);
  const [reviews,setReviews] = useState<Review[]>([]);
  const [saved,setSaved] = useState<Set<string>>(new Set());
  const [user,setUser] = useState<SessionUser>(null);
  const [query,setQuery] = useState('');
  const [selected,setSelected] = useState<Property|null>(null);
  const [tab,setTab] = useState<'homes'|'agents'>('homes');
  const [loading,setLoading] = useState(true);
  const [authOpen,setAuthOpen] = useState(false);
  const [reviewOpen,setReviewOpen] = useState(false);
  const [message,setMessage] = useState('');

  async function loadPublicData() {
    const [{data:p},{data:a},{data:r}] = await Promise.all([
      supabase.from('properties').select('*').order('score',{ascending:false}),
      supabase.from('agents').select('*').order('full_name'),
      supabase.from('property_reviews').select('id,property_id,relationship,overall_rating,review_text,verification_status,created_at').eq('moderation_status','approved').order('created_at',{ascending:false})
    ]);
    setProperties((p||[]) as Property[]); setAgents((a||[]) as Agent[]); setReviews((r||[]) as Review[]); setLoading(false);
  }

  async function loadSaved(userId:string) {
    const {data} = await supabase.from('saved_properties').select('property_id').eq('user_id',userId);
    setSaved(new Set((data||[]).map(x=>x.property_id)));
  }

  useEffect(() => {
    void loadPublicData();
    void supabase.auth.getSession().then(({data}) => { const u=data.session?.user?{id:data.session.user.id,email:data.session.user.email}:null; setUser(u); if(u) void loadSaved(u.id); });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{const u=session?.user?{id:session.user.id,email:session.user.email}:null;setUser(u);if(u)void loadSaved(u.id);else setSaved(new Set());});
    return()=>subscription.unsubscribe();
  },[supabase]);

  const filtered=properties.filter(p=>`${p.address} ${p.city} ${p.state} ${p.zip}`.toLowerCase().includes(query.toLowerCase()));
  const selectedReviews=selected?reviews.filter(r=>r.property_id===selected.id):[];

  async function signInWithGoogle(){setMessage('Opening Google sign in...');const{error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/auth/callback`}});if(error)setMessage(error.message);}
  async function signOut(){await supabase.auth.signOut();setAuthOpen(false);setMessage('Signed out.');}
  async function toggleSave(propertyId:string){if(!user){setAuthOpen(true);setMessage('Sign in to save homes.');return;}if(saved.has(propertyId)){const{error}=await supabase.from('saved_properties').delete().eq('user_id',user.id).eq('property_id',propertyId);if(!error)setSaved(prev=>{const n=new Set(prev);n.delete(propertyId);return n;});else setMessage(error.message);}else{const{error}=await supabase.from('saved_properties').insert({user_id:user.id,property_id:propertyId});if(!error)setSaved(prev=>new Set(prev).add(propertyId));else setMessage(error.message);}}
  async function submitReview(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!selected)return;if(!user){setReviewOpen(false);setAuthOpen(true);setMessage('Sign in before submitting a review.');return;}const form=new FormData(e.currentTarget);setMessage('Submitting review...');const{error}=await supabase.from('property_reviews').insert({property_id:selected.id,reviewer_id:user.id,relationship:String(form.get('relationship')),overall_rating:Number(form.get('overall_rating')),noise_rating:Number(form.get('noise_rating')),maintenance_rating:Number(form.get('maintenance_rating')),build_quality_rating:Number(form.get('build_quality_rating')),parking_rating:Number(form.get('parking_rating')),hoa_rating:Number(form.get('hoa_rating')),review_text:String(form.get('review_text')),verification_status:'unverified',moderation_status:'pending'});if(error){setMessage(error.message);return;}setReviewOpen(false);setMessage('Review submitted. It will appear publicly after moderation.');}

  return <main>
    <nav><div className="brand">Home<span>Truth</span></div><div className="navlinks"><button onClick={()=>setTab('homes')}>Homes</button><button onClick={()=>setTab('agents')}>Realtors</button><button className="dark" onClick={()=>setAuthOpen(true)}>{user?'Account':'Sign in'}</button></div></nav>
    <section className="hero"><div className="eyebrow">PROPERTY REPUTATION, BUILT OVER TIME</div><h1>Know the home <em>before</em><br/>you buy the home.</h1><p>Real experiences from owners, tenants, buyers and sellers—attached to the property, not just the listing.</p><div className="searchWrap"><form className="search" action="/search" method="get"><span>⌕</span><input name="q" value={query} onChange={e=>{setQuery(e.target.value);setTab('homes')}} placeholder="Search a U.S. street address..." required/><button type="submit">Search</button></form></div><div className="trust">✓ Real U.S. address lookup &nbsp; · &nbsp; Persistent property history &nbsp; · &nbsp; Realtor accountability</div>{message&&<div className="flash">{message}</div>}</section>
    {tab==='homes'?<section className="content"><div className="sectionHead"><div><div className="eyebrow">HOMETRUTH PROFILES</div><h2>Explore homes</h2></div><p>{properties.length} property profiles</p></div>{loading?<p>Loading properties...</p>:filtered.length===0&&query.trim()?<div className="notice">Click Search above to search this address.</div>:<div className="grid">{filtered.map(p=><article className="card" key={p.id}><div className="photo" onClick={()=>setSelected(p)}><div className="score">★ {Number(p.score).toFixed(1)}</div><div className="house">⌂</div></div><div className="cardbody"><h3 onClick={()=>setSelected(p)}>{p.address}</h3><p>{p.city}, {p.state} {p.zip}</p><div className="facts"><b>{p.beds??'—'}</b> beds <b>{p.baths??'—'}</b> baths <b>{p.sqft?.toLocaleString()??'—'}</b> sqft</div><p className="summary">{p.summary}</p><div className="cardActions"><button className="link" onClick={()=>setSelected(p)}>View profile →</button><button className="save" onClick={()=>void toggleSave(p.id)}>{saved.has(p.id)?'♥ Saved':'♡ Save'}</button></div></div></article>)}</div>}</section>:<section className="content"><div className="sectionHead"><div><div className="eyebrow">PROFESSIONAL REPUTATION</div><h2>Realtor profiles</h2></div><p>{agents.length} profiles</p></div><div className="agentGrid">{agents.map(a=><article className="agent" key={a.id}><div className="avatar">{a.full_name.split(' ').map(x=>x[0]).join('')}</div><div><h3>{a.full_name}</h3><p>{a.brokerage}</p><small>{a.state} license · {a.license_number}</small></div><div className="agentScore">★ New</div></article>)}</div></section>}
    <section className="how"><div className="eyebrow">WHY HOMETRUTH</div><h2>A permanent reputation layer for real estate.</h2><div className="steps"><div><b>01</b><h3>Search any home</h3><p>Find or create a persistent profile tied to a real U.S. address—not a temporary listing.</p></div><div><b>02</b><h3>Learn from residents</h3><p>See structured feedback on noise, maintenance, build quality, parking and HOA experience.</p></div><div><b>03</b><h3>Review the transaction</h3><p>Verified buyers and sellers can also review the real estate professionals involved.</p></div></div></section>
    {selected&&<div className="modal" onClick={()=>setSelected(null)}><div className="panel" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><div className="eyebrow">PROPERTY PROFILE</div><h2>{selected.address}</h2><p>{selected.city}, {selected.state} {selected.zip}</p><div className="bigscore">★ {Number(selected.score).toFixed(1)} <small>Home Score</small></div><div className="profileFacts"><span><b>{selected.beds??'—'}</b> beds</span><span><b>{selected.baths??'—'}</b> baths</span><span><b>{selected.sqft?.toLocaleString()??'—'}</b> sqft</span><span><b>{selected.year_built??'—'}</b> built</span></div><p>{selected.summary}</p><div className="profileButtons"><button className="darkButton" onClick={()=>setReviewOpen(true)}>Review this home</button><button className="outlineButton" onClick={()=>void toggleSave(selected.id)}>{saved.has(selected.id)?'♥ Saved':'♡ Save home'}</button></div><h3 className="reviewHeading">Resident reviews</h3>{selectedReviews.length===0?<div className="notice">No approved reviews yet. Be the first to share an experience with this property.</div>:selectedReviews.map(r=><div className="review" key={r.id}><div><b>★ {r.overall_rating}/5</b> · {r.relationship} {r.verification_status==='verified'&&<span className="verified">✓ Verified</span>}</div><p>{r.review_text}</p></div>)}</div></div>}
    {authOpen&&<div className="modal" onClick={()=>setAuthOpen(false)}><div className="panel small" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setAuthOpen(false)}>×</button><div className="eyebrow">YOUR HOMETRUTH ACCOUNT</div>{user?<><h2>You're signed in</h2><p>{user.email}</p><p>{saved.size} saved home{saved.size===1?'':'s'}</p><button className="darkButton" onClick={()=>void signOut()}>Sign out</button></>:<><h2>Sign in to HomeTruth</h2><p>Use your Google account to save homes, create property profiles and submit reviews.</p><button className="darkButton" type="button" onClick={()=>void signInWithGoogle()}>Continue with Google</button></>}</div></div>}
    {reviewOpen&&selected&&<div className="modal" onClick={()=>setReviewOpen(false)}><div className="panel reviewPanel" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setReviewOpen(false)}>×</button><div className="eyebrow">REVIEW THIS HOME</div><h2>{selected.address}</h2><form className="reviewForm" onSubmit={submitReview}><label>Your relationship<select name="relationship" defaultValue="Former owner"><option>Current owner</option><option>Former owner</option><option>Current tenant</option><option>Former tenant</option><option>Buyer</option><option>Seller</option><option>Visitor</option></select></label><div className="ratingGrid">{[['overall_rating','Overall'],['noise_rating','Noise'],['maintenance_rating','Maintenance'],['build_quality_rating','Build quality'],['parking_rating','Parking'],['hoa_rating','HOA']].map(([name,label])=><label key={name}>{label}<select name={name} defaultValue="5">{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} / 5</option>)}</select></label>)}</div><label>What should a future buyer or renter know?<textarea name="review_text" required minLength={20} maxLength={1500}/></label><button className="darkButton" type="submit">Submit for moderation</button></form></div></div>}
    <footer><div className="brand">Home<span>Truth</span></div><p>Every home has a history. We make it visible.</p></footer>
  </main>;
}
