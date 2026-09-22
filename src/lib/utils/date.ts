import type { MealCategory } from '../db/types';

/** Lokaler Tagesschluessel im Format YYYY-MM-DD (nie UTC). */
export function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDayKey(new Date());
}

/** Wandelt einen Tagesschluessel in die lokale Mitternacht dieses Tages. */
export function fromDayKey(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, date ?? 1);
}

/** Verschiebt einen Tagesschluessel um die angegebene Anzahl Tage. */
export function addDays(day: string, amount: number): string {
  const date = fromDayKey(day);
  date.setDate(date.getDate() + amount);
  return toDayKey(date);
}

/** Anzahl ganzer Tage zwischen zwei Tagesschluesseln. */
export function daysBetween(from: string, to: string): number {
  const millis = fromDayKey(to).getTime() - fromDayKey(from).getTime();
  return Math.round(millis / 86_400_000);
}

const longFormat = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const fullFormat = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const weekdayFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });

/** "Dienstag, 22. September" */
export function formatDayLong(day: string): string {
  return longFormat.format(fromDayKey(day));
}

/** "22.09." */
export function formatDayShort(day: string): string {
  const [, month, date] = day.split('-');
  return `${date}.${month}.`;
}

/** "22.09.2026" */
export function formatDayFull(day: string): string {
  return fullFormat.format(fromDayKey(day));
}

/** "Di" */
export function formatWeekday(day: string): string {
  return weekdayFormat.format(fromDayKey(day));
}

/**
 * Bezeichnung eines Tages relativ zu heute, damit Listen ohne Rechnen
 * lesbar bleiben.
 */
export function describeDay(day: string, today = todayKey()): string {
  const diff = daysBetween(day, today);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  return formatDayLong(day);
}

/** Kurzform fuer Listen: "Heute", "Gestern" oder "So, 20.09.". */
export function describeDayShort(day: string, today = todayKey()): string {
  const diff = daysBetween(day, today);
  if (diff === 0) return 'Heute';
  if (diff === 1) return 'Gestern';
  return `${formatWeekday(day)}, ${formatDayShort(day)}`;
}

/** Schlaegt anhand der Uhrzeit eine Kategorie vor; immer aenderbar. */
export function suggestCategory(date = new Date()): MealCategory {
  const hour = date.getHours();
  if (hour >= 4 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 17 && hour < 22) return 'dinner';
  return 'snack';
}

export const CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittagessen',
  dinner: 'Abendessen',
  snack: 'Snack',
};

/** Kurzform fuer schmale Bedienelemente. */
export const CATEGORY_SHORT_LABELS: Record<MealCategory, string> = {
  breakfast: 'Früh',
  lunch: 'Mittag',
  dinner: 'Abend',
  snack: 'Snack',
};

export const CATEGORY_ORDER: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];
