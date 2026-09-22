import { toOffProduct, toOffProducts, type OffProduct } from './product';

export type OffResult<T> = { ok: true; value: T } | { ok: false; error: string };

const BASE = 'https://world.openfoodfacts.org';
const FIELDS =
  'code,product_name,product_name_de,generic_name,brands,quantity,serving_size,serving_quantity,nutriments';
const TIMEOUT_MS = 12_000;

const OFFLINE_MESSAGE = 'Keine Internetverbindung. Alles andere in der App funktioniert weiter.';
const FAILED_MESSAGE = 'Open Food Facts ist gerade nicht erreichbar.';

// Als Funktion, weil sich der Wert waehrend der Anfrage aendern kann.
const isOffline = () => navigator.onLine === false;

async function getJson(url: string): Promise<OffResult<unknown>> {
  if (isOffline()) return { ok: false, error: OFFLINE_MESSAGE };

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, error: FAILED_MESSAGE };
    return { ok: true, value: await response.json() };
  } catch {
    // Auch abgelaufene Zeitlimits und DNS-Fehler landen hier.
    return { ok: false, error: isOffline() ? OFFLINE_MESSAGE : FAILED_MESSAGE };
  }
}

export async function searchProducts(query: string, limit = 20): Promise<OffResult<OffProduct[]>> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return { ok: true, value: [] };

  const url =
    `${BASE}/cgi/search.pl?search_simple=1&action=process&json=1` +
    `&search_terms=${encodeURIComponent(trimmed)}&page_size=${limit}&fields=${FIELDS}`;

  const result = await getJson(url);
  return result.ok ? { ok: true, value: toOffProducts(result.value) } : result;
}

export async function fetchProductByBarcode(barcode: string): Promise<OffResult<OffProduct>> {
  const clean = barcode.replace(/\D/g, '');
  if (clean === '') return { ok: false, error: 'Kein gültiger Barcode.' };

  const result = await getJson(`${BASE}/api/v2/product/${clean}.json?fields=${FIELDS}`);
  if (!result.ok) return result;

  const body = result.value as { product?: unknown };
  const product = toOffProduct(body?.product);
  return product
    ? { ok: true, value: product }
    : { ok: false, error: 'Zu diesem Barcode gibt es keine brauchbaren Nährwerte.' };
}
