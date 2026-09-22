import type { FoodEntry, Nutrients } from '../db/types';
import { addNutrients, entryNutrients, ZERO_NUTRIENTS } from './nutrition';

export interface DaySummary {
  day: string;
  totals: Nutrients;
  /** Anzahl der Eintraege an diesem Tag. */
  count: number;
}

/** Fasst Eintraege je Tag zusammen, neueste Tage zuerst. */
export function summarizeDays(entries: FoodEntry[]): DaySummary[] {
  const byDay = new Map<string, DaySummary>();

  for (const entry of entries) {
    const existing = byDay.get(entry.day);
    if (existing) {
      existing.totals = addNutrients(existing.totals, entryNutrients(entry));
      existing.count += 1;
    } else {
      byDay.set(entry.day, {
        day: entry.day,
        totals: addNutrients(ZERO_NUTRIENTS, entryNutrients(entry)),
        count: 1,
      });
    }
  }

  return [...byDay.values()].sort((a, b) => b.day.localeCompare(a.day));
}
