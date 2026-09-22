import { describe, expect, it } from 'vitest';
import { displayName, toOffProduct, toOffProducts } from './product';

const skyr = {
  code: '5701959015527',
  product_name: 'Skyr Natur',
  brands: 'Arla, Arla Foods',
  quantity: '450 g',
  serving_size: '150 g',
  serving_quantity: 150,
  nutriments: {
    'energy-kcal_100g': 63,
    proteins_100g: 11,
    fat_100g: 0.2,
    carbohydrates_100g: 4,
  },
};

describe('toOffProduct', () => {
  it('liest ein vollstaendiges Produkt', () => {
    expect(toOffProduct(skyr)).toEqual({
      barcode: '5701959015527',
      name: 'Skyr Natur',
      brand: 'Arla',
      per100: { kcal: 63, protein: 11, fat: 0.2, carbs: 4 },
      unit: 'g',
      servingName: '150 g',
      servingSize: 150,
    });
  });

  it('bevorzugt den deutschen Produktnamen', () => {
    expect(toOffProduct({ ...skyr, product_name_de: 'Skyr natur' })?.name).toBe('Skyr natur');
  });

  it('rechnet Kilojoule um, wenn keine kcal angegeben sind', () => {
    const product = toOffProduct({
      ...skyr,
      nutriments: { energy_100g: 1000, proteins_100g: 5 },
    });
    expect(product?.per100.kcal).toBeCloseTo(239.0, 1);
    expect(product?.per100.protein).toBe(5);
  });

  it('akzeptiert Zahlen als Zeichenkette', () => {
    const product = toOffProduct({
      ...skyr,
      nutriments: { 'energy-kcal_100g': '63', proteins_100g: '11' },
    });
    expect(product?.per100.kcal).toBe(63);
    expect(product?.per100.protein).toBe(11);
  });

  it('setzt fehlende Makros auf null', () => {
    const product = toOffProduct({ ...skyr, nutriments: { 'energy-kcal_100g': 63 } });
    expect(product?.per100).toEqual({ kcal: 63, protein: 0, fat: 0, carbs: 0 });
  });

  it('erkennt Milliliter an der Mengenangabe', () => {
    expect(toOffProduct({ ...skyr, quantity: '1 l', serving_size: '250 ml' })?.unit).toBe('ml');
  });

  it('laesst die Portion weg, wenn sie unvollstaendig ist', () => {
    const product = toOffProduct({ ...skyr, serving_quantity: null });
    expect(product).not.toHaveProperty('servingName');
    expect(product).not.toHaveProperty('servingSize');
  });

  it('lehnt Produkte ohne Namen oder Kalorien ab', () => {
    expect(toOffProduct({ ...skyr, product_name: '' })).toBeNull();
    expect(toOffProduct({ ...skyr, nutriments: {} })).toBeNull();
    expect(toOffProduct({ ...skyr, code: undefined, _id: undefined })).toBeNull();
  });

  it('kommt mit unerwarteten Daten klar', () => {
    expect(toOffProduct(null)).toBeNull();
    expect(toOffProduct('kaputt')).toBeNull();
    expect(toOffProduct([])).toBeNull();
    expect(toOffProduct({})).toBeNull();
  });
});

describe('toOffProducts', () => {
  it('liest eine Trefferliste und laesst Unbrauchbares aus', () => {
    const products = toOffProducts({
      products: [skyr, { code: '1', product_name: 'Ohne Werte' }, { ...skyr, code: '2' }],
    });
    expect(products.map((product) => product.barcode)).toEqual(['5701959015527', '2']);
  });

  it('entfernt doppelte Barcodes', () => {
    expect(toOffProducts({ products: [skyr, skyr] })).toHaveLength(1);
  });

  it('gibt bei unerwarteten Antworten eine leere Liste zurueck', () => {
    expect(toOffProducts(null)).toEqual([]);
    expect(toOffProducts({})).toEqual([]);
    expect(toOffProducts({ products: 'nope' })).toEqual([]);
  });
});

describe('displayName', () => {
  it('haengt die Marke an', () => {
    expect(displayName(toOffProduct(skyr)!)).toBe('Skyr Natur (Arla)');
  });

  it('kommt ohne Marke aus', () => {
    const product = toOffProduct({ ...skyr, brands: '' })!;
    expect(displayName(product)).toBe('Skyr Natur');
  });
});
