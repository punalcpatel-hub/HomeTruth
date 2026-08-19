'use client';

import { FormEvent, useState } from 'react';

export default function SearchBox({ defaultValue = '' }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    const value = query.trim();
    if (!value) return;
    event.preventDefault();
    window.location.assign(`/search?q=${encodeURIComponent(value)}`);
  }

  return <form className="search" action="/search" method="get" onSubmit={submitSearch}>
    <span>⌕</span>
    <input
      name="q"
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Search a U.S. street address..."
      autoComplete="street-address"
      required
    />
    <button type="submit">Search</button>
  </form>;
}
