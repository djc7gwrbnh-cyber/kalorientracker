import type { Food, FoodEntry, Meal, UserProfile, WeightEntry, WorkoutEntry } from '../db/types';

export const BACKUP_FORMAT = 'kalorientracker-backup';
/** 2 seit dem Trainings-Tab; Version 1 laesst sich weiterhin einlesen. */
export const BACKUP_VERSION = 2;

export interface Backup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  profile: UserProfile | null;
  foods: Food[];
  meals: Meal[];
  entries: FoodEntry[];
  weights: WeightEntry[];
  workouts: WorkoutEntry[];
}

export interface BackupCounts {
  foods: number;
  meals: number;
  entries: number;
  weights: number;
  workouts: number;
  hasProfile: boolean;
}

export type ParseResult =
  | { ok: true; backup: Backup }
  | { ok: false; error: string };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isDay = (value: unknown): value is string =>
  isString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value);

const isUnit = (value: unknown): boolean => value === 'g' || value === 'ml';

const isCategory = (value: unknown): boolean =>
  value === 'breakfast' || value === 'lunch' || value === 'dinner' || value === 'snack';

function isNutrients(value: unknown): boolean {
  return (
    isObject(value) &&
    isNumber(value.kcal) &&
    isNumber(value.protein) &&
    isNumber(value.fat) &&
    isNumber(value.carbs)
  );
}

function isFood(value: unknown): boolean {
  return (
    isObject(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isNutrients(value.per100) &&
    isUnit(value.unit) &&
    typeof value.favorite === 'boolean' &&
    isNumber(value.usageCount)
  );
}

function isMeal(value: unknown): boolean {
  return (
    isObject(value) &&
    isString(value.id) &&
    isString(value.name) &&
    typeof value.favorite === 'boolean' &&
    isNumber(value.usageCount) &&
    Array.isArray(value.ingredients) &&
    value.ingredients.every(
      (ingredient) =>
        isObject(ingredient) && isString(ingredient.foodId) && isNumber(ingredient.amount),
    )
  );
}

function isEntry(value: unknown): boolean {
  return (
    isObject(value) &&
    isString(value.id) &&
    isNumber(value.timestamp) &&
    isDay(value.day) &&
    isCategory(value.category) &&
    isNumber(value.amount) &&
    isString(value.name) &&
    isNutrients(value.per100) &&
    isUnit(value.unit)
  );
}

function isWeight(value: unknown): boolean {
  return isObject(value) && isDay(value.day) && isNumber(value.weight);
}

function isWorkout(value: unknown): boolean {
  return isObject(value) && isDay(value.day) && isString(value.type);
}

function isProfile(value: unknown): boolean {
  return (
    isObject(value) &&
    isNumber(value.height) &&
    isNumber(value.calorieGoal) &&
    isNumber(value.proteinGoal) &&
    isNumber(value.fatGoal)
  );
}

/**
 * Liest eine Backup-Datei und prueft sie vollstaendig, bevor irgendetwas
 * ueberschrieben wird. Fehlermeldungen sind fuer die Anzeige gedacht.
 */
export function parseBackup(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Die Datei ist keine gültige JSON-Datei.' };
  }

  if (!isObject(data)) return { ok: false, error: 'Die Datei hat kein erwartetes Format.' };
  if (data.format !== BACKUP_FORMAT) {
    return { ok: false, error: 'Die Datei stammt nicht aus dieser App.' };
  }
  if (!isNumber(data.version) || data.version > BACKUP_VERSION) {
    return {
      ok: false,
      error: 'Die Datei stammt aus einer neueren Version. Bitte aktualisiere zuerst die App.',
    };
  }

  const sections: [string, unknown, (item: unknown) => boolean][] = [
    ['Lebensmittel', data.foods, isFood],
    ['Mahlzeiten', data.meals, isMeal],
    ['Einträge', data.entries, isEntry],
    ['Gewichtswerte', data.weights, isWeight],
  ];

  for (const [label, list, check] of sections) {
    if (!Array.isArray(list)) return { ok: false, error: `Der Abschnitt „${label}“ fehlt.` };
    if (!list.every(check)) return { ok: false, error: `Der Abschnitt „${label}“ ist fehlerhaft.` };
  }

  // Erst ab Version 2 dabei: aeltere Dateien bleiben gueltig.
  const workouts = data.workouts ?? [];
  if (!Array.isArray(workouts) || !workouts.every(isWorkout)) {
    return { ok: false, error: 'Der Abschnitt „Trainingseinheiten“ ist fehlerhaft.' };
  }

  const profile = data.profile ?? null;
  if (profile !== null && !isProfile(profile)) {
    return { ok: false, error: 'Das Profil in der Datei ist fehlerhaft.' };
  }

  return { ok: true, backup: { ...data, workouts } as unknown as Backup };
}

export function countBackup(backup: Backup): BackupCounts {
  return {
    foods: backup.foods.length,
    meals: backup.meals.length,
    entries: backup.entries.length,
    weights: backup.weights.length,
    workouts: backup.workouts.length,
    hasProfile: backup.profile !== null,
  };
}

export function backupFileName(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `kalorientracker-${year}-${month}-${day}.json`;
}
