import type { FoodEntry, Nutrients } from '../db/types';

export const ZERO_NUTRIENTS: Nutrients = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

/**
 * Rechnet Naehrwerte pro 100 g/ml auf eine Menge hoch. Es wird immer mit
 * vollen Werten gerechnet, gerundet wird erst bei der Anzeige.
 */
export function scaleNutrients(per100: Nutrients, amount: number): Nutrients {
  const factor = amount / 100;
  return {
    kcal: per100.kcal * factor,
    protein: per100.protein * factor,
    fat: per100.fat * factor,
    carbs: per100.carbs * factor,
  };
}

export function addNutrients(a: Nutrients, b: Nutrients): Nutrients {
  return {
    kcal: a.kcal + b.kcal,
    protein: a.protein + b.protein,
    fat: a.fat + b.fat,
    carbs: a.carbs + b.carbs,
  };
}

export function sumNutrients(values: Nutrients[]): Nutrients {
  return values.reduce(addNutrients, ZERO_NUTRIENTS);
}

/** Naehrwerte eines Eintrags aus seinem Snapshot und seiner Menge. */
export function entryNutrients(entry: Pick<FoodEntry, 'per100' | 'amount'>): Nutrients {
  return scaleNutrients(entry.per100, entry.amount);
}

export function sumEntries(entries: Pick<FoodEntry, 'per100' | 'amount'>[]): Nutrients {
  return sumNutrients(entries.map(entryNutrients));
}
