import { createId, db } from './db';
import type { Food, FoodSource, Nutrients, Unit } from './types';

/** Gepruefte Werte, wie sie gespeichert werden. */
export interface FoodValues {
  name: string;
  per100: Nutrients;
  unit: Unit;
  servingName?: string;
  servingSize?: number;
  favorite: boolean;
  source: FoodSource;
  barcode?: string;
}

/** Formularzustand: Zahlen sind null, solange nichts Gueltiges dasteht. */
export interface FoodDraft {
  name: string;
  kcal: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  unit: Unit;
  servingName: string;
  servingSize: number | null;
  favorite: boolean;
  source: FoodSource;
  barcode?: string;
}

export function emptyFoodDraft(): FoodDraft {
  return {
    name: '',
    kcal: null,
    protein: null,
    fat: null,
    carbs: null,
    unit: 'g',
    servingName: '',
    servingSize: null,
    favorite: false,
    source: 'own',
  };
}

export function toFoodDraft(food: Food): FoodDraft {
  return {
    name: food.name,
    kcal: food.per100.kcal,
    protein: food.per100.protein,
    fat: food.per100.fat,
    carbs: food.per100.carbs,
    unit: food.unit,
    servingName: food.servingName ?? '',
    servingSize: food.servingSize ?? null,
    favorite: food.favorite,
    source: food.source,
    barcode: food.barcode,
  };
}

/**
 * Prueft den Formularzustand und gibt die speicherbaren Werte zurueck,
 * oder null, wenn etwas fehlt oder unplausibel ist.
 */
export function toFoodValues(draft: FoodDraft): FoodValues | null {
  const name = draft.name.trim();
  if (!name) return null;

  const { kcal, protein, fat, carbs } = draft;
  for (const value of [kcal, protein, fat, carbs]) {
    if (value === null || value < 0) return null;
  }

  const servingName = draft.servingName.trim();
  const hasServingName = servingName.length > 0;
  const hasServingSize = draft.servingSize !== null && draft.servingSize > 0;
  // Eine Portion braucht beides, sonst waere sie nicht verwendbar.
  if (hasServingName !== hasServingSize) return null;

  const values: FoodValues = {
    name,
    per100: { kcal: kcal!, protein: protein!, fat: fat!, carbs: carbs! },
    unit: draft.unit,
    favorite: draft.favorite,
    source: draft.source,
  };
  if (hasServingName) {
    values.servingName = servingName;
    values.servingSize = draft.servingSize!;
  }
  if (draft.barcode) values.barcode = draft.barcode;

  return values;
}

export async function listFoods(): Promise<Food[]> {
  const foods = await db.foods.toArray();
  return foods.sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export async function getFood(id: string): Promise<Food | undefined> {
  return db.foods.get(id);
}

export async function createFood(values: FoodValues): Promise<Food> {
  const now = Date.now();
  const food: Food = { ...values, id: createId(), usageCount: 0, createdAt: now, updatedAt: now };
  await db.foods.add(food);
  return food;
}

/**
 * Aktualisiert ein Lebensmittel. Bereits eingetragene Mahlzeiten bleiben
 * unveraendert, weil sie einen eigenen Snapshot besitzen.
 */
export async function updateFood(id: string, values: FoodValues): Promise<void> {
  const existing = await db.foods.get(id);
  if (!existing) return;

  const updated: Food = {
    ...existing,
    ...values,
    id,
    updatedAt: Date.now(),
  };
  // Nicht gesetzte Portion muss auch wirklich verschwinden.
  if (values.servingName === undefined) delete updated.servingName;
  if (values.servingSize === undefined) delete updated.servingSize;
  if (values.barcode === undefined) delete updated.barcode;

  await db.foods.put(updated);
}

export async function deleteFood(id: string): Promise<void> {
  await db.foods.delete(id);
}

export async function setFoodFavorite(id: string, favorite: boolean): Promise<void> {
  await db.foods.update(id, { favorite, updatedAt: Date.now() });
}

/** Zaehlt die Verwendung hoch, damit haeufige Lebensmittel nach oben kommen. */
export async function markFoodUsed(id: string, at = Date.now()): Promise<void> {
  const food = await db.foods.get(id);
  if (!food) return;
  await db.foods.update(id, { usageCount: food.usageCount + 1, lastUsedAt: at });
}
