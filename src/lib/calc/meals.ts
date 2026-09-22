import type { Food, FoodEntry, Meal, MealCategory, MealIngredient, Nutrients } from '../db/types';
import { scaleNutrients, sumNutrients } from './nutrition';

export interface ResolvedIngredient {
  foodId: string;
  amount: number;
  /** Fehlt, wenn das Lebensmittel inzwischen geloescht wurde. */
  food?: Food;
}

export function resolveIngredients(
  ingredients: MealIngredient[],
  foodsById: Map<string, Food>,
): ResolvedIngredient[] {
  return ingredients.map((ingredient) => ({
    foodId: ingredient.foodId,
    amount: ingredient.amount,
    food: foodsById.get(ingredient.foodId),
  }));
}

/**
 * Summe einer Mahlzeit. Wird immer frisch berechnet und nie gespeichert,
 * damit Aenderungen an den Zutaten sofort durchschlagen. Geloeschte
 * Lebensmittel zaehlen mit null.
 */
export function mealNutrients(
  ingredients: MealIngredient[],
  foodsById: Map<string, Food>,
  factor = 1,
): Nutrients {
  return sumNutrients(
    resolveIngredients(ingredients, foodsById)
      .filter((ingredient) => ingredient.food !== undefined)
      .map((ingredient) => scaleNutrients(ingredient.food!.per100, ingredient.amount * factor)),
  );
}

export interface MealEntryOptions {
  day: string;
  category: MealCategory;
  timestamp: number;
  groupId: string;
  /** Portionsfaktor, z. B. 0,5 fuer eine halbe Mahlzeit. */
  factor?: number;
}

/**
 * Macht aus einer Mahlzeit einen Eintrag je Zutat. Die gemeinsame groupId
 * haelt sie zusammen, damit die Tagesliste sie als eine Zeile zeigt.
 */
export function mealToEntries(
  meal: Pick<Meal, 'id' | 'name' | 'ingredients'>,
  foodsById: Map<string, Food>,
  options: MealEntryOptions,
): Omit<FoodEntry, 'id'>[] {
  const factor = options.factor ?? 1;

  return resolveIngredients(meal.ingredients, foodsById)
    .filter((ingredient) => ingredient.food !== undefined)
    .map((ingredient, index) => {
      const food = ingredient.food!;
      return {
        // Versetzte Zeitstempel halten die Reihenfolge der Zutaten stabil.
        timestamp: options.timestamp + index,
        day: options.day,
        category: options.category,
        amount: ingredient.amount * factor,
        name: food.name,
        per100: { ...food.per100 },
        unit: food.unit,
        foodId: food.id,
        mealGroupId: options.groupId,
        mealName: meal.name,
      };
    });
}
