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

type AddressMatch = {
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number | null;
  longitude: number | null;
};

function parseTypedAddress(q: string): AddressMatch | null {
  const parts = q.split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 3) return null;

  const street = parts[0];
  const city = parts[1];
  const stateZip = parts.slice(2).join(' ');
  const match = stateZip.match(/\b([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
  if (!street || !city || !match) return null;

  return {
    address: street,
    city,
    state: match[1].toUpperCase(),
    zip: match[2],
    latitude: null,
    longitude: null,
  };
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 5) return NextResponse.json({ matches: [] });

  const typedFallback = parseTypedAddress(q);
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

    if (response.ok) {
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

      if (matches.length > 0) {
        console.log('[address-search] upstream success', { q, count: matches.length });
        return NextResponse.json({ matches });
      }
    } else {
      console.error('[address-search] upstream failed', response.status);
    }
  } catch (error) {
    console.error('[address-search] upstream exception', String(error));
  }

  if (typedFallback) {
    console.log('[address-search] using typed fallback', { q });
    return NextResponse.json({ matches: [typedFallback], fallback: true });
  }

  console.log('[address-search] no match', { q });
  return NextResponse.json({ matches: [] });
}
