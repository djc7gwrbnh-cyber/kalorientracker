import { describe, expect, it } from 'vitest';
import { backupFileName, countBackup, parseBackup, type Backup } from './format';

function validBackup(overrides: Partial<Backup> = {}): Backup {
  return {
    format: 'kalorientracker-backup',
    version: 2,
    exportedAt: '2026-09-22T08:00:00.000Z',
    profile: {
      id: 'profile',
      height: 180,
      calorieGoal: 2500,
      proteinGoal: 180,
      fatGoal: 80,
      createdAt: 0,
      updatedAt: 0,
    },
    foods: [
      {
        id: 'f1',
        name: 'Skyr',
        per100: { kcal: 65, protein: 11, fat: 0.2, carbs: 4 },
        unit: 'g',
        favorite: true,
        usageCount: 3,
        source: 'own',
        createdAt: 0,
        updatedAt: 0,
      },
    ],
    meals: [
      {
        id: 'm1',
        name: 'Skyr Bowl',
        favorite: true,
        usageCount: 1,
        ingredients: [{ foodId: 'f1', amount: 300 }],
        createdAt: 0,
        updatedAt: 0,
      },
    ],
    entries: [
      {
        id: 'e1',
        timestamp: 1_700_000_000_000,
        day: '2026-09-22',
        category: 'breakfast',
        amount: 300,
        name: 'Skyr',
        per100: { kcal: 65, protein: 11, fat: 0.2, carbs: 4 },
        unit: 'g',
      },
    ],
    weights: [{ day: '2026-09-22', weight: 108.4, updatedAt: 0 }],
    workouts: [{ day: '2026-09-22', type: 'Push', createdAt: 0, updatedAt: 0 }],
    ...overrides,
  };
}

const parse = (backup: unknown) => parseBackup(JSON.stringify(backup));

describe('parseBackup', () => {
  it('nimmt ein gueltiges Backup an', () => {
    const result = parse(validBackup());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.backup.foods[0]?.name).toBe('Skyr');
  });

  it('akzeptiert ein leeres, aber gueltiges Backup', () => {
    const result = parse(
      validBackup({ profile: null, foods: [], meals: [], entries: [], weights: [], workouts: [] }),
    );
    expect(result.ok).toBe(true);
  });

  it('liest ein Backup der Version 1 ohne Trainingsdaten', () => {
    const backup = validBackup({ version: 1 }) as unknown as Record<string, unknown>;
    delete backup.workouts;

    const result = parse(backup);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.backup.workouts).toEqual([]);
  });

  it('erkennt fehlerhafte Trainingseinheiten', () => {
    const result = parse(
      validBackup({ workouts: [{ day: '22.09.2026', type: 'Push' }] as unknown as Backup['workouts'] }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('Trainingseinheiten');
  });

  it('lehnt kaputtes JSON ab', () => {
    const result = parseBackup('{nope');
    expect(result).toEqual({ ok: false, error: 'Die Datei ist keine gültige JSON-Datei.' });
  });

  it('lehnt fremde Dateien ab', () => {
    const result = parse({ format: 'etwas-anderes', version: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('nicht aus dieser App');
  });

  it('lehnt neuere Versionen ab', () => {
    const result = parse(validBackup({ version: 99 }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('neueren Version');
  });

  it('meldet fehlende Abschnitte', () => {
    const backup = validBackup() as unknown as Record<string, unknown>;
    delete backup.entries;
    const result = parse(backup);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('Einträge');
  });

  it('erkennt fehlerhafte Lebensmittel', () => {
    const result = parse(
      validBackup({ foods: [{ id: 'f1', name: 'Kaputt' }] as unknown as Backup['foods'] }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('Lebensmittel');
  });

  it('erkennt einen ungueltigen Tagesschluessel', () => {
    const result = parse(
      validBackup({
        weights: [{ day: '22.09.2026', weight: 108.4, updatedAt: 0 }] as Backup['weights'],
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('Gewichtswerte');
  });

  it('erkennt eine unbekannte Kategorie', () => {
    const entries = validBackup().entries.map((entry) => ({ ...entry, category: 'brunch' }));
    const result = parse(validBackup({ entries: entries as unknown as Backup['entries'] }));
    expect(result.ok).toBe(false);
  });

  it('erkennt ein fehlerhaftes Profil', () => {
    const result = parse(
      validBackup({ profile: { id: 'profile' } as unknown as Backup['profile'] }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('Profil');
  });
});

describe('countBackup', () => {
  it('zaehlt die Abschnitte', () => {
    expect(countBackup(validBackup())).toEqual({
      foods: 1,
      meals: 1,
      entries: 1,
      weights: 1,
      workouts: 1,
      hasProfile: true,
    });
  });
});

describe('backupFileName', () => {
  it('enthaelt das lokale Datum', () => {
    expect(backupFileName(new Date(2026, 8, 22, 23, 30))).toBe('kalorientracker-2026-09-22.json');
  });
});
