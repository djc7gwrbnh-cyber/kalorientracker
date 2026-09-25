import { db } from './db';
import type { WorkoutEntry } from './types';

/** Pro Tag gibt es hoechstens eine Einheit; eine neue ersetzt die alte. */
export async function setWorkout(day: string, type: string, note?: string): Promise<void> {
  const now = Date.now();
  const existing = await db.workouts.get(day);

  const entry: WorkoutEntry = {
    day,
    type: type.trim(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const cleanNote = note?.trim();
  if (cleanNote) entry.note = cleanNote;

  await db.workouts.put(entry);
}

export async function getWorkout(day: string): Promise<WorkoutEntry | undefined> {
  return db.workouts.get(day);
}

/** Alle Einheiten chronologisch aufsteigend. */
export async function listWorkouts(): Promise<WorkoutEntry[]> {
  return db.workouts.orderBy('day').toArray();
}

export async function deleteWorkout(day: string): Promise<void> {
  await db.workouts.delete(day);
}
