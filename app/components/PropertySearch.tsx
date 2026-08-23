'use client';

import { FormEvent, useState } from 'react';

export default function PropertySearch({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);

  function go() {
    const value = query.trim();
    if (!value) return;
    window.location.assign(`/?q=${encodeURIComponent(value)}`);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    go();
  }

  return (
    <form className="search" action="/" method="get" onSubmit={submit} style={{ position: 'relative', zIndex: 50 }}>
      <span>⌕</span>
      <input
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="3797 East Mead Dr, Chandler, AZ 85249"
        autoComplete="street-address"
        required
      />
      <button type="button" onClick={go} style={{ position: 'relative', zIndex: 51, pointerEvents: 'auto' }}>
        Search
      </button>
    </form>
  );
}
