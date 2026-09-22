import { describe, expect, it } from 'vitest';
import { emptyMealDraft, toMealValues, type MealDraft } from './meals';

function bowl(overrides: Partial<MealDraft> = {}): MealDraft {
  return {
    ...emptyMealDraft(),
    name: 'Skyr Bowl',
    ingredients: [
      { foodId: 'skyr', amount: 300 },
      { foodId: 'pulver', amount: 30 },
    ],
    ...overrides,
  };
}

describe('toMealValues', () => {
  it('uebernimmt Name und Zutaten', () => {
    expect(toMealValues(bowl())).toEqual({
      name: 'Skyr Bowl',
      favorite: false,
      ingredients: [
        { foodId: 'skyr', amount: 300 },
        { foodId: 'pulver', amount: 30 },
      ],
    });
  });

  it('entfernt Leerzeichen um den Namen', () => {
    expect(toMealValues(bowl({ name: '  Skyr Bowl ' }))?.name).toBe('Skyr Bowl');
  });

  it('lehnt fehlenden Namen ab', () => {
    expect(toMealValues(bowl({ name: '  ' }))).toBeNull();
  });

  it('lehnt eine Mahlzeit ohne Zutaten ab', () => {
    expect(toMealValues(bowl({ ingredients: [] }))).toBeNull();
  });

  it('lehnt unvollstaendige oder leere Mengen ab', () => {
    expect(toMealValues(bowl({ ingredients: [{ foodId: 'skyr', amount: null }] }))).toBeNull();
    expect(toMealValues(bowl({ ingredients: [{ foodId: 'skyr', amount: 0 }] }))).toBeNull();
    expect(toMealValues(bowl({ ingredients: [{ foodId: 'skyr', amount: -5 }] }))).toBeNull();
  });

  it('uebernimmt den Favoritenstatus', () => {
    expect(toMealValues(bowl({ favorite: true }))?.favorite).toBe(true);
  });
});
