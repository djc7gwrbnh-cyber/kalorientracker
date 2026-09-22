import { describe, expect, it } from 'vitest';
import type { Food } from '../db/types';
import { mealNutrients, mealToEntries, resolveIngredients } from './meals';

function food(id: string, name: string, per100: Food['per100']): Food {
  return {
    id,
    name,
    per100,
    unit: 'g',
    favorite: false,
    usageCount: 0,
    source: 'own',
    createdAt: 0,
    updatedAt: 0,
  };
}

const skyr = food('skyr', 'Skyr', { kcal: 65, protein: 11, fat: 0.2, carbs: 4 });
const pulver = food('pulver', 'Proteinpulver', {
  kcal: 374,
  protein: 80,
  fat: 3.5,
  carbs: 5.5,
});

const foodsById = new Map([
  [skyr.id, skyr],
  [pulver.id, pulver],
]);

const bowl = {
  id: 'bowl',
  name: 'Skyr Bowl',
  ingredients: [
    { foodId: 'skyr', amount: 300 },
    { foodId: 'pulver', amount: 30 },
  ],
};

describe('mealNutrients', () => {
  it('summiert die Zutaten', () => {
    const total = mealNutrients(bowl.ingredients, foodsById);
    expect(total.kcal).toBeCloseTo(195 + 112.2, 10);
    expect(total.protein).toBeCloseTo(33 + 24, 10);
    expect(total.fat).toBeCloseTo(0.6 + 1.05, 10);
    expect(total.carbs).toBeCloseTo(12 + 1.65, 10);
  });

  it('beruecksichtigt den Portionsfaktor', () => {
    const half = mealNutrients(bowl.ingredients, foodsById, 0.5);
    const full = mealNutrients(bowl.ingredients, foodsById);
    expect(half.kcal).toBeCloseTo(full.kcal / 2, 10);
  });

  it('ignoriert geloeschte Lebensmittel', () => {
    const total = mealNutrients(
      [...bowl.ingredients, { foodId: 'weg', amount: 100 }],
      foodsById,
    );
    expect(total.kcal).toBeCloseTo(307.2, 10);
  });

  it('ergibt ohne Zutaten null', () => {
    expect(mealNutrients([], foodsById)).toEqual({ kcal: 0, protein: 0, fat: 0, carbs: 0 });
  });
});

describe('resolveIngredients', () => {
  it('markiert fehlende Lebensmittel', () => {
    const resolved = resolveIngredients([{ foodId: 'weg', amount: 50 }], foodsById);
    expect(resolved[0]?.food).toBeUndefined();
  });
});

describe('mealToEntries', () => {
  const options = {
    day: '2026-09-22',
    category: 'breakfast' as const,
    timestamp: 1000,
    groupId: 'group-1',
  };

  it('erzeugt einen Eintrag je Zutat mit gemeinsamer Gruppe', () => {
    const entries = mealToEntries(bowl, foodsById, options);

    expect(entries).toHaveLength(2);
    expect(entries.every((entry) => entry.mealGroupId === 'group-1')).toBe(true);
    expect(entries.every((entry) => entry.mealName === 'Skyr Bowl')).toBe(true);
    expect(entries.every((entry) => entry.day === '2026-09-22')).toBe(true);
  });

  it('uebernimmt den Naehrwert-Snapshot des Lebensmittels', () => {
    const [first] = mealToEntries(bowl, foodsById, options);
    expect(first?.name).toBe('Skyr');
    expect(first?.amount).toBe(300);
    expect(first?.per100).toEqual(skyr.per100);
    expect(first?.foodId).toBe('skyr');
  });

  it('rechnet den Portionsfaktor in die Mengen', () => {
    const entries = mealToEntries(bowl, foodsById, { ...options, factor: 0.5 });
    expect(entries.map((entry) => entry.amount)).toEqual([150, 15]);
  });

  it('haelt die Reihenfolge ueber versetzte Zeitstempel', () => {
    const entries = mealToEntries(bowl, foodsById, options);
    expect(entries.map((entry) => entry.timestamp)).toEqual([1000, 1001]);
  });

  it('laesst geloeschte Lebensmittel aus', () => {
    const entries = mealToEntries(
      { ...bowl, ingredients: [...bowl.ingredients, { foodId: 'weg', amount: 10 }] },
      foodsById,
      options,
    );
    expect(entries).toHaveLength(2);
  });
});
