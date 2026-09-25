import Dexie, { type Table } from 'dexie';
import type { Food, FoodEntry, Meal, UserProfile, WeightEntry, WorkoutEntry } from './types';

/**
 * Schema-Aenderungen kommen immer als neue version(...)-Zeile dazu, damit
 * bestehende Daten bei einem App-Update erhalten bleiben.
 */
class AppDatabase extends Dexie {
  profile!: Table<UserProfile, string>;
  foods!: Table<Food, string>;
  meals!: Table<Meal, string>;
  entries!: Table<FoodEntry, string>;
  weights!: Table<WeightEntry, string>;
  workouts!: Table<WorkoutEntry, string>;

  constructor() {
    super('kalorientracker');

    this.version(1).stores({
      profile: 'id',
      foods: 'id, name, favorite, usageCount, lastUsedAt, barcode',
      meals: 'id, name, favorite, usageCount, lastUsedAt',
      entries: 'id, day, [day+category], timestamp, foodId, mealGroupId',
      weights: 'day',
    });

    // Neue Tabelle in einer eigenen Version: bestehende Daten bleiben erhalten.
    this.version(2).stores({
      workouts: 'day, type',
    });
  }
}

export const db = new AppDatabase();

export function createId(): string {
  return crypto.randomUUID();
}
