import { BACKUP_FORMAT, BACKUP_VERSION, type Backup } from '../backup/format';
import { db } from './db';

export async function createBackup(): Promise<Backup> {
  const [profile, foods, meals, entries, weights, workouts] = await Promise.all([
    db.profile.get('profile'),
    db.foods.toArray(),
    db.meals.toArray(),
    db.entries.toArray(),
    db.weights.toArray(),
    db.workouts.toArray(),
  ]);

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    profile: profile ?? null,
    foods,
    meals,
    entries,
    weights,
    workouts,
  };
}

/**
 * Schreibt ein Backup zurueck. Alles passiert in einer Transaktion: bricht
 * etwas ab, bleibt der bisherige Stand unveraendert erhalten.
 */
export async function restoreBackup(backup: Backup): Promise<void> {
  const tables = [db.profile, db.foods, db.meals, db.entries, db.weights, db.workouts];
  await db.transaction('rw', tables, async () => {
    await Promise.all([
      db.profile.clear(),
      db.foods.clear(),
      db.meals.clear(),
      db.entries.clear(),
      db.weights.clear(),
      db.workouts.clear(),
    ]);

    if (backup.profile) await db.profile.put(backup.profile);
    if (backup.foods.length > 0) await db.foods.bulkAdd(backup.foods);
    if (backup.meals.length > 0) await db.meals.bulkAdd(backup.meals);
    if (backup.entries.length > 0) await db.entries.bulkAdd(backup.entries);
    if (backup.weights.length > 0) await db.weights.bulkAdd(backup.weights);
    if (backup.workouts.length > 0) await db.workouts.bulkAdd(backup.workouts);
  });
}
