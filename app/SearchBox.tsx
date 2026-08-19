'use client';

import { FormEvent, useState } from 'react';

export default function SearchBox({ defaultValue = '' }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    const value = query.trim();
    if (!value) return;

    event.preventDefault();
    const url = `/search?q=${encodeURIComponent(value)}`;
    window.location.assign(url);
  }

  return <form className="search" action="/search" method