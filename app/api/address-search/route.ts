import { NextRequest, NextResponse } from 'next/server';

type CensusMatch = {
  matchedAddress?: string;
  coordinates?: { x?: number; y?: number };
  addressComponents?: {
    city?: string;
    state?: string;
    zip?: string;
  };
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 5) return NextResponse.json({ matches: [] });

  const url = new URL('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress');
  url.searchParams.set('address', q);
  url.searchParams.set('benchmark', 'Public_AR_Current');
  url.searchParams.set('format', 'json');

  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 86400 } });
    if (!response.ok) return NextResponse.json({ matches: [] }, { status: 502 });
    const data = await response.json();
    const matches = ((data?.result?.addressMatches || []) as CensusMatch[]).slice(0, 5).map((match) => ({
      address: match.matchedAddress || q,
      city: match.addressComponents?.city || '',
      state: match.addressComponents?.state || '',
      zip: match.addressComponents?.zip || '',
      latitude: match.coordinates?.y ?? null,
      longitude: match.coordinates?.x ?? null,
    }));
    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ matches: [] }, { status: 502 });
  }
}
