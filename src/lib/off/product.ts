import { emptyFoodDraft, type FoodDraft } from '../db/foods';
import type { Nutrients, Unit } from '../db/types';

/** Ein aus Open Food Facts gelesenes Produkt, bereit zum Bearbeiten. */
export interface OffProduct {
  barcode: string;
  name: string;
  brand?: string;
  per100: Nutrients;
  unit: Unit;
  servingName?: string;
  servingSize?: number;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Open Food Facts liefert Zahlen mal als Zahl, mal als Zeichenkette. */
function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

/** Kilojoule in Kilokalorien, falls keine kcal-Angabe vorliegt. */
function kcalFrom(nutriments: Record<string, unknown>): number | null {
  const kcal = toNumber(nutriments['energy-kcal_100g']);
  if (kcal !== null) return kcal;

  const kj = toNumber(nutriments['energy-kj_100g']) ?? toNumber(nutriments['energy_100g']);
  return kj === null ? null : kj / 4.184;
}

function unitOf(raw: Record<string, unknown>): Unit {
  const text = [toText(raw.quantity), toText(raw.serving_size)].join(' ').toLowerCase();
  return /\b\d*\s*(ml|cl|l|liter)\b/.test(text) ? 'ml' : 'g';
}

/**
 * Macht aus einem Open-Food-Facts-Produkt unsere Struktur. Gibt null zurueck,
 * wenn Name oder Kalorien fehlen – dann waere der Eintrag nutzlos.
 */
export function toOffProduct(raw: unknown): OffProduct | null {
  if (!isObject(raw)) return null;

  const barcode = toText(raw.code) ?? toText(raw._id);
  if (!barcode) return null;

  const name = toText(raw.product_name_de) ?? toText(raw.product_name) ?? toText(raw.generic_name);
  if (!name) return null;

  const nutriments = isObject(raw.nutriments) ? raw.nutriments : {};
  const kcal = kcalFrom(nutriments);
  if (kcal === null) return null;

  const product: OffProduct = {
    barcode,
    name,
    per100: {
      kcal,
      protein: toNumber(nutriments.proteins_100g) ?? 0,
      fat: toNumber(nutriments.fat_100g) ?? 0,
      carbs: toNumber(nutriments.carbohydrates_100g) ?? 0,
    },
    unit: unitOf(raw),
  };

  const brand = toText(raw.brands)?.split(',')[0]?.trim();
  if (brand) product.brand = brand;

  const servingSize = toNumber(raw.serving_quantity);
  const servingName = toText(raw.serving_size);
  if (servingSize !== null && servingSize > 0 && servingName) {
    product.servingName = servingName;
    product.servingSize = servingSize;
  }

  return product;
}

/** Liest die Produktliste einer Suchantwort und laesst unbrauchbare aus. */
export function toOffProducts(raw: unknown): OffProduct[] {
  if (!isObject(raw) || !Array.isArray(raw.products)) return [];

  const products: OffProduct[] = [];
  const seen = new Set<string>();
  for (const entry of raw.products) {
    const product = toOffProduct(entry);
    if (product && !seen.has(product.barcode)) {
      seen.add(product.barcode);
      products.push(product);
    }
  }
  return products;
}

/** Name samt Marke, wie er in der Trefferliste erscheint. */
export function displayName(product: OffProduct): string {
  return product.brand ? `${product.name} (${product.brand})` : product.name;
}

/** Aus Kilojoule gerechnete Werte haben sonst unschoene Nachkommastellen. */
function round(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Fuellt das Formular vor. Gespeichert wird erst, wenn der Nutzer die Werte
 * geprueft und bestaetigt hat.
 */
export function offProductToDraft(product: OffProduct): FoodDraft {
  return {
    ...emptyFoodDraft(),
    name: displayName(product),
    kcal: round(product.per100.kcal),
    protein: round(product.per100.protein),
    fat: round(product.per100.fat),
    carbs: round(product.per100.carbs),
    unit: product.unit,
    servingName: product.servingName ?? '',
    servingSize: product.servingSize ?? null,
    source: 'off',
    barcode: product.barcode,
  };
}
