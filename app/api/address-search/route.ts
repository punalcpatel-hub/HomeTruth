import { NextRequest, NextResponse } from 'next/server';

type NominatimResult = {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    state_code?: string;
    postcode?: string;
  };
};

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 5) return NextResponse.json({ matches: [] });

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('countrycodes', 'us');
  url.searchParams.set('limit', '5');

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'HomeTruthPrototype/1.0 (property-search)'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('[address-search] upstream failed', response.status);
      return NextResponse.json({ matches: [], error: 'Address service unavailable' }, { status: 502 });
    }

    const data = (await response.json()) as NominatimResult[];
    const matches = data.map((item) => {
      const a = item.address || {};
      const street = [a.house_number, a.road].filter(Boolean).join(' ').trim();
      const city = a.city || a.town || a.village || a.municipality || '';
      const state = (a.state_code || a.state || '').replace(/^US-/, '');
      const zip = a.postcode || '';

      return {
        address: street || item.display_name || q,
        city,
        state,
        zip,
        latitude: item.lat ? Number(item.lat) : null,
        longitude: item.lon ? Number(item.lon) : null,
      };
    }).filter((m) => m.address && m.city && m.state && m.zip);

    console.log('[address-search] success', { q, count: matches.length });
    return NextResponse.json({ matches });
  } catch (error) {
    console.error('[address-search] failed', String(error));
    return NextResponse.json({ matches: [], error: 'Address search failed' }, { status: 502 });
  }
}
