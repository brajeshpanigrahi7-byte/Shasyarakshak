import { MandiPriceRecord } from '../types';

// Real Government of India open dataset: "Variety-wise Daily Market Prices Data of Commodity",
// published by the Ministry of Agriculture & Farmers Welfare via data.gov.in / AGMARKNET.
// Resource ID is public and stable; see https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

export function isMandiApiConfigured(): boolean {
  return Boolean(import.meta.env.VITE_DATAGOVIN_API_KEY);
}

interface RawRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety?: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export async function fetchMandiPrices(commodity: string, state?: string): Promise<MandiPriceRecord[]> {
  const apiKey = import.meta.env.VITE_DATAGOVIN_API_KEY;
  if (!apiKey) {
    throw new Error('MANDI_API_NOT_CONFIGURED');
  }

  const params = new URLSearchParams({
    'api-key': apiKey,
    format: 'json',
    limit: '20',
    'filters[commodity]': commodity,
  });
  if (state) params.set('filters[state]', state);

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Mandi price request failed (${res.status})`);
  }
  const data = await res.json();
  const records: RawRecord[] = data.records ?? [];

  return records.map((r) => ({
    state: r.state,
    district: r.district,
    market: r.market,
    commodity: r.commodity,
    variety: r.variety || '',
    arrivalDate: r.arrival_date,
    minPrice: parseFloat(r.min_price) || 0,
    maxPrice: parseFloat(r.max_price) || 0,
    modalPrice: parseFloat(r.modal_price) || 0,
  }));
}
