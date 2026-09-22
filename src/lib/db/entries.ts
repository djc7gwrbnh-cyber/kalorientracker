import { createId, db } from './db';
import type { FoodEntry } from './types';

export type NewEntry = Omit<FoodEntry, 'id'>;

/** Alle Eintraege eines Tages, chronologisch. */
export async function listEntriesForDay(day: string): Promise<FoodEntry[]> {
  const entries = await db.entries.where('day').equals(day).toArray();
  return entries.sort((a, b) => a.timestamp - b.timestamp);
}

export async function addEntries(entries: NewEntry[]): Promise<string[]> {
  const withIds = entries.map((entry) => ({ ...entry, id: createId() }));
  await db.entries.bulkAdd(withIds);
  return withIds.map((entry) => entry.id);
}

export async function updateEntry(
  id: string,
  changes: Partial<Omit<FoodEntry, 'id'>>,
): Promise<void> {
  await db.entries.update(id, changes);
}

export async function deleteEntries(ids: string[]): Promise<void> {
  await db.entries.bulkDelete(ids);
}

/** Alle Tage mit mindestens einem Eintrag, neueste zuerst. */
export async function listDaysWithEntries(): Promise<string[]> {
  const days = await db.entries.orderBy('day').uniqueKeys();
  return days.map(String).reverse();
}
