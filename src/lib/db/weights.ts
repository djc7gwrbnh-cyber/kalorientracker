import { db } from './db';
import type { WeightEntry } from './types';

/** Pro Tag gibt es hoechstens einen Eintrag; ein zweiter ersetzt den ersten. */
export async function setWeight(day: string, weight: number): Promise<void> {
  await db.weights.put({ day, weight, updatedAt: Date.now() });
}

export async function getWeight(day: string): Promise<WeightEntry | undefined> {
  return db.weights.get(day);
}

/** Alle Eintraege chronologisch aufsteigend. */
export async function listWeights(): Promise<WeightEntry[]> {
  return db.weights.orderBy('day').toArray();
}

export async function deleteWeight(day: string): Promise<void> {
  await db.weights.delete(day);
}
