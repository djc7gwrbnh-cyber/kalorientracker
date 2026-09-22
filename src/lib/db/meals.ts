import { createId, db } from './db';
import type { Meal, MealIngredient } from './types';

export interface MealValues {
  name: string;
  favorite: boolean;
  ingredients: MealIngredient[];
}

/** Formularzustand: Mengen sind null, solange nichts Gueltiges dasteht. */
export interface MealDraft {
  name: string;
  favorite: boolean;
  ingredients: { foodId: string; amount: number | null }[];
}

export function emptyMealDraft(): MealDraft {
  return { name: '', favorite: false, ingredients: [] };
}

export function toMealDraft(meal: Meal): MealDraft {
  return {
    name: meal.name,
    favorite: meal.favorite,
    ingredients: meal.ingredients.map((ingredient) => ({ ...ingredient })),
  };
}

/** Eine Mahlzeit braucht einen Namen und mindestens eine gueltige Zutat. */
export function toMealValues(draft: MealDraft): MealValues | null {
  const name = draft.name.trim();
  if (!name) return null;
  if (draft.ingredients.length === 0) return null;

  const ingredients: MealIngredient[] = [];
  for (const ingredient of draft.ingredients) {
    if (ingredient.amount === null || ingredient.amount <= 0) return null;
    ingredients.push({ foodId: ingredient.foodId, amount: ingredient.amount });
  }

  return { name, favorite: draft.favorite, ingredients };
}

export async function listMeals(): Promise<Meal[]> {
  const meals = await db.meals.toArray();
  return meals.sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

export async function createMeal(values: MealValues): Promise<Meal> {
  const now = Date.now();
  const meal: Meal = { ...values, id: createId(), usageCount: 0, createdAt: now, updatedAt: now };
  await db.meals.add(meal);
  return meal;
}

/**
 * Aktualisiert eine Mahlzeit. Bereits eingetragene Tage bleiben unveraendert,
 * weil jeder Eintrag seinen eigenen Snapshot hat.
 */
export async function updateMeal(id: string, values: MealValues): Promise<void> {
  const existing = await db.meals.get(id);
  if (!existing) return;
  await db.meals.put({ ...existing, ...values, id, updatedAt: Date.now() });
}

export async function deleteMeal(id: string): Promise<void> {
  await db.meals.delete(id);
}

export async function setMealFavorite(id: string, favorite: boolean): Promise<void> {
  await db.meals.update(id, { favorite, updatedAt: Date.now() });
}

export async function markMealUsed(id: string, at = Date.now()): Promise<void> {
  const meal = await db.meals.get(id);
  if (!meal) return;
  await db.meals.update(id, { usageCount: meal.usageCount + 1, lastUsedAt: at });
}
