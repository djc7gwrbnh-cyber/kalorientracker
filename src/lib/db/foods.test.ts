import { describe, expect, it } from 'vitest';
import { emptyFoodDraft, toFoodValues, type FoodDraft } from './foods';

function skyrDraft(overrides: Partial<FoodDraft> = {}): FoodDraft {
  return {
    ...emptyFoodDraft(),
    name: 'Skyr',
    kcal: 65,
    protein: 11,
    fat: 0.2,
    carbs: 4,
    ...overrides,
  };
}

describe('toFoodValues', () => {
  it('uebernimmt gueltige Werte', () => {
    expect(toFoodValues(skyrDraft())).toEqual({
      name: 'Skyr',
      per100: { kcal: 65, protein: 11, fat: 0.2, carbs: 4 },
      unit: 'g',
      favorite: false,
      source: 'own',
    });
  });

  it('entfernt Leerzeichen um den Namen', () => {
    expect(toFoodValues(skyrDraft({ name: '  Skyr  ' }))?.name).toBe('Skyr');
  });

  it('erlaubt Naehrwerte von null', () => {
    const values = toFoodValues(skyrDraft({ kcal: 0, protein: 0, fat: 0, carbs: 0 }));
    expect(values?.per100).toEqual({ kcal: 0, protein: 0, fat: 0, carbs: 0 });
  });

  it('lehnt fehlenden Namen ab', () => {
    expect(toFoodValues(skyrDraft({ name: '' }))).toBeNull();
    expect(toFoodValues(skyrDraft({ name: '   ' }))).toBeNull();
  });

  it('lehnt fehlende oder negative Naehrwerte ab', () => {
    expect(toFoodValues(skyrDraft({ kcal: null }))).toBeNull();
    expect(toFoodValues(skyrDraft({ protein: null }))).toBeNull();
    expect(toFoodValues(skyrDraft({ fat: -1 }))).toBeNull();
    expect(toFoodValues(skyrDraft({ carbs: -0.5 }))).toBeNull();
  });

  it('uebernimmt eine vollstaendige Portion', () => {
    const values = toFoodValues(skyrDraft({ servingName: '1 Becher', servingSize: 450 }));
    expect(values?.servingName).toBe('1 Becher');
    expect(values?.servingSize).toBe(450);
  });

  it('lehnt eine halbe Portionsangabe ab', () => {
    expect(toFoodValues(skyrDraft({ servingName: '1 Becher' }))).toBeNull();
    expect(toFoodValues(skyrDraft({ servingSize: 450 }))).toBeNull();
    expect(toFoodValues(skyrDraft({ servingName: '1 Becher', servingSize: 0 }))).toBeNull();
  });

  it('laesst die Portion weg, wenn beide Felder leer sind', () => {
    const values = toFoodValues(skyrDraft({ servingName: '  ', servingSize: null }));
    expect(values).not.toBeNull();
    expect(values).not.toHaveProperty('servingName');
    expect(values).not.toHaveProperty('servingSize');
  });

  it('uebernimmt Einheit, Favorit und Quelle', () => {
    const values = toFoodValues(
      skyrDraft({ unit: 'ml', favorite: true, source: 'off', barcode: '1234' }),
    );
    expect(values?.unit).toBe('ml');
    expect(values?.favorite).toBe(true);
    expect(values?.source).toBe('off');
    expect(values?.barcode).toBe('1234');
  });
});
