import type { FoodEntry } from '../db/types';

export type EntryGroup =
  | { kind: 'single'; key: string; entry: FoodEntry }
  | { kind: 'meal'; key: string; name: string; entries: FoodEntry[] };

/**
 * Fasst Eintraege mit gemeinsamer mealGroupId zu einer Zeile zusammen. Die
 * Reihenfolge richtet sich nach dem jeweils ersten Eintrag der Gruppe.
 */
export function groupEntries(entries: FoodEntry[]): EntryGroup[] {
  const groups: EntryGroup[] = [];
  const byGroupId = new Map<string, Extract<EntryGroup, { kind: 'meal' }>>();

  for (const entry of entries) {
    if (entry.mealGroupId === undefined) {
      groups.push({ kind: 'single', key: entry.id, entry });
      continue;
    }

    const existing = byGroupId.get(entry.mealGroupId);
    if (existing) {
      existing.entries.push(entry);
      continue;
    }

    const group: Extract<EntryGroup, { kind: 'meal' }> = {
      kind: 'meal',
      key: entry.mealGroupId,
      name: entry.mealName ?? 'Mahlzeit',
      entries: [entry],
    };
    byGroupId.set(entry.mealGroupId, group);
    groups.push(group);
  }

  return groups;
}
