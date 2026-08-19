export type PropertyLookup = {
  source: 'rentcast' | 'attom' | 'regrid' | 'census';
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude?: number;
  longitude?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  propertyType?: string;
  parcelNumber?: string;
};

function splitAddress(input: string) {
  const parts = input.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length < 3) return null;
  const address = parts[0];
  const city = parts[1];
  const stateZip = parts.slice(2).join(' ');
  const match = stateZip.match(/\b([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)\b/);
  if (!match) return null;
  return { address, city, state: match[1].toUpperCase(), zip: match[2] };
}

async function rentCastLookup(fullAddress: string): Promise<PropertyLookup | null> {
  const key = process.env.RENTCAST_API_KEY;
  if (!key) return null;
  const url = new URL('https://api.rentcast.io/v1/properties');
  url.searchParams.set('address', fullAddress);
  url.searchParams.set('limit', '1');
  const response = await fetch(url, { headers: { 'X-Api-Key': key, Accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) return null;
  const data = await response.json();
  const p = Array.isArray(data) ? data[0] : null;
  if (!p) return null;
  return {
    source: 'rentcast',
    address: p.addressLine1 || p.formattedAddress?.split(',')[0] || fullAddress,
    city: p.city || '', state: p.state || '', zip: p.zipCode || '',
    latitude: p.latitude, longitude: p.longitude,
    beds: p.bedrooms, baths: p.bathrooms, sqft: p.squareFootage,
    yearBuilt: p.yearBuilt, propertyType: p.propertyType,
    parcelNumber: p.assessorID || p.id,
  };
}

async function attomLookup(fullAddress: string): Promise<PropertyLookup | null> {
  const key = process.env.ATTOM_API_KEY;
  if (!key) return null;
  const url = new URL('https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/basicprofile');
  url.searchParams.set('address', fullAddress);
  const response = await fetch(url, { headers: { apikey: key, Accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) return null;
  const data = await response.json();
  const p = data?.property?.[0];
  if (!p) return null;
  const parsed = splitAddress(fullAddress);
  return {
    source: 'attom',
    address: p.address?.line1 || parsed?.address || fullAddress,
    city: p.address?.locality || parsed?.city || '',
    state: p.address?.countrySubd || parsed?.state || '',
    zip: p.address?.postal1 || parsed?.zip || '',
    latitude: Number(p.location?.latitude) || undefined,
    longitude: Number(p.location?.longitude) || undefined,
    beds: Number(p.building?.rooms?.beds) || undefined,
    baths: Number(p.building?.rooms?.bathstotal) || undefined,
    sqft: Number(p.building?.size?.livingsize) || undefined,
    yearBuilt: Number(p.summary?.yearbuilt) || undefined,
    propertyType: p.summary?.proptype,
    parcelNumber: p.identifier?.apn,
  };
}

async function regridLookup(fullAddress: string): Promise<PropertyLookup | null> {
  const token = process.env.REGRID_API_TOKEN;
  if (!token) return null;
  const url = new URL('https://app.regrid.com/api/v2/parcels/address');
  url.searchParams.set('query', fullAddress);
  url.searchParams.set('limit', '1');
  url.searchParams.set('token', token);
  const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) return null;
  const data = await response.json();
  const feature = data?.parcels?.features?.[0];
  if (!feature) return null;
  const p = feature.properties || {};
  const parsed = splitAddress(fullAddress);
  const center = feature.geometry?.type === 'Point' ? feature.geometry.coordinates : null;
  return {
    source: 'regrid',
    address: p.address || p.saddress || parsed?.address || fullAddress,
    city: p.scity || p.city || parsed?.city || '',
    state: p.state2 || parsed?.state || '',
    zip: p.szip || parsed?.zip || '',
    latitude: center?.[1], longitude: center?.[0],
    yearBuilt: Number(p.yearbuilt) || undefined,
    parcelNumber: p.parcelnumb || p.ll_uuid,
    propertyType: p.usedesc || p.usecode,
  };
}

async function censusLookup(fullAddress: string): Promise<PropertyLookup | null> {
  const parsed = splitAddress(fullAddress);
  if (!parsed) return null;
  const url = new URL('https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress');
  url.searchParams.set('address', fullAddress);
  url.searchParams.set('benchmark', 'Public_AR_Current');
  url.searchParams.set('vintage', 'Current_Current');
  url.searchParams.set('format', 'json');
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return null;
  const data = await response.json();
  const match = data?.result?.addressMatches?.[0];
  if (!match) return null;
  return {
    source: 'census',
    address: match.addressComponents?.fromAddress && match.addressComponents?.streetName
      ? `${match.addressComponents.fromAddress} ${match.addressComponents.preType || ''} ${match.addressComponents.streetName} ${match.addressComponents.suffixType || ''}`.replace(/\s+/g, ' ').trim()
      : parsed.address,
    city: match.addressComponents?.city || parsed.city,
    state: match.addressComponents?.state || parsed.state,
    zip: match.addressComponents?.zip || parsed.zip,
    latitude: match.coordinates?.y,
    longitude: match.coordinates?.x,
  };
}

export async function lookupProperty(fullAddress: string): Promise<PropertyLookup | null> {
  const providers = [rentCastLookup, attomLookup, regridLookup, censusLookup];
  for (const provider of providers) {
    try {
      const result = await provider(fullAddress);
      if (result) return result;
    } catch {
      // Try the next provider. Search should degrade gracefully instead of failing.
    }
  }
  return null;
}
