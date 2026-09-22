import { mealToEntries } from './calc/meals';
import { createId } from './db/db';
import { addEntries, deleteEntries } from './db/entries';
import { markFoodUsed } from './db/foods';
import { markMealUsed } from './db/meals';
import type { Food, Meal, MealCategory } from './db/types';

export interface AddContext {
  day: string;
  category: MealCategory;
}

/** Traegt ein Lebensmittel ein und gibt die neuen IDs fuer "Rückgängig" zurueck. */
export async function addFoodEntry(
  food: Food,
  amount: number,
  context: AddContext,
): Promise<string[]> {
  const ids = await addEntries([
    {
      timestamp: Date.now(),
      day: context.day,
      category: context.category,
      amount,
      name: food.name,
      per100: { ...food.per100 },
      unit: food.unit,
      foodId: food.id,
    },
  ]);
  await markFoodUsed(food.id);
  return ids;
}

/** Traegt eine Mahlzeit als einen Eintrag je Zutat ein. */
export async function addMealEntries(
  meal: Meal,
  foodsById: Map<string, Food>,
  context: AddContext,
  factor = 1,
): Promise<string[]> {
  const entries = mealToEntries(meal, foodsById, {
    day: context.day,
    category: context.category,
    timestamp: Date.now(),
    groupId: createId(),
    factor,
  });
  if (entries.length === 0) return [];

  const ids = await addEntries(entries);
  await markMealUsed(meal.id);
  return ids;
}

export async function undoEntries(ids: string[]): Promise<void> {
  await deleteEntries(ids);
}
