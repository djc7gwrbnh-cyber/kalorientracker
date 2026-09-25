import { describe, expect, it } from 'vitest';
import type { WorkoutEntry } from '../db/types';
import {
  buildYearGrid,
  colorForType,
  startOfWeek,
  summarizeTypes,
  workoutStats,
  yearsWithData,
} from './workouts';

function entry(day: string, type: string): WorkoutEntry {
  return { day, type, createdAt: 0, updatedAt: 0 };
}

describe('buildYearGrid', () => {
  it('enthaelt jeden Tag des Jahres', () => {
    expect(buildYearGrid(2026).cells).toHaveLength(365);
    expect(buildYearGrid(2024).cells).toHaveLength(366);
  });

  it('beginnt die Woche am Montag', () => {
    const grid = buildYearGrid(2026);
    // Der 1.1.2026 ist ein Donnerstag.
    const first = grid.cells[0]!;
    expect(first.day).toBe('2026-01-01');
    expect(first.weekday).toBe(3);
    expect(first.weekIndex).toBe(0);
  });

  it('setzt Montage in eine neue Spalte', () => {
    const grid = buildYearGrid(2026);
    const monday = grid.cells.find((cell) => cell.day === '2026-01-05')!;
    expect(monday.weekday).toBe(0);
    expect(monday.weekIndex).toBe(1);
  });

  it('beginnt bei einem Montag als Neujahr in Spalte 0', () => {
    // Der 1.1.2024 ist ein Montag.
    const grid = buildYearGrid(2024);
    expect(grid.cells[0]).toMatchObject({ day: '2024-01-01', weekday: 0, weekIndex: 0 });
  });

  it('meldet genug Spalten fuer das ganze Jahr', () => {
    const grid = buildYearGrid(2026);
    const last = grid.cells[grid.cells.length - 1]!;
    expect(last.day).toBe('2026-12-31');
    expect(grid.weeks).toBe(last.weekIndex + 1);
    expect(grid.weeks).toBeGreaterThanOrEqual(52);
    expect(grid.weeks).toBeLessThanOrEqual(54);
  });

  it('liefert zwoelf Monatsbeschriftungen in aufsteigender Reihenfolge', () => {
    const { monthLabels } = buildYearGrid(2026);
    expect(monthLabels).toHaveLength(12);
    expect(monthLabels.map((label) => label.month)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
    for (let i = 1; i < monthLabels.length; i++) {
      expect(monthLabels[i]!.weekIndex).toBeGreaterThan(monthLabels[i - 1]!.weekIndex);
    }
  });
});

describe('startOfWeek', () => {
  it('geht auf den Montag zurueck', () => {
    expect(startOfWeek('2026-09-25')).toBe('2026-09-21');
    expect(startOfWeek('2026-09-21')).toBe('2026-09-21');
    expect(startOfWeek('2026-09-27')).toBe('2026-09-21');
  });
});

describe('workoutStats', () => {
  it('ist ohne Eintraege bei null', () => {
    expect(workoutStats([], 2026, '2026-09-25')).toEqual({ total: 0, thisWeek: 0, perWeek: 0 });
  });

  it('zaehlt nur das gewaehlte Jahr', () => {
    const stats = workoutStats(['2025-12-30', '2026-01-02', '2026-01-05'], 2026, '2026-01-05');
    expect(stats.total).toBe(2);
  });

  it('zaehlt die laufende Woche ab Montag', () => {
    const stats = workoutStats(
      ['2026-09-20', '2026-09-21', '2026-09-23', '2026-09-25'],
      2026,
      '2026-09-25',
    );
    // Der 20.09. ist ein Sonntag und gehoert zur Vorwoche.
    expect(stats.thisWeek).toBe(3);
  });

  it('rechnet den Schnitt pro Woche bis heute', () => {
    const stats = workoutStats(['2026-01-01', '2026-01-08'], 2026, '2026-01-14');
    expect(stats.perWeek).toBeCloseTo(1, 5);
  });

  it('rechnet einen einzelnen Eintrag nicht auf sieben pro Woche hoch', () => {
    const stats = workoutStats(['2026-01-01'], 2026, '2026-01-01');
    expect(stats.perWeek).toBeCloseTo(1, 5);
  });

  it('nutzt bei abgelaufenem Jahr das Jahresende als Ende', () => {
    const stats = workoutStats(['2025-01-01', '2025-12-31'], 2025, '2026-09-25');
    expect(stats.total).toBe(2);
    expect(stats.perWeek).toBeCloseTo((2 / 365) * 7, 5);
  });
});

describe('summarizeTypes', () => {
  it('gibt fuer keine Eintraege nichts zurueck', () => {
    expect(summarizeTypes([])).toEqual([]);
  });

  it('zaehlt je Art und haelt die Reihenfolge des ersten Auftretens', () => {
    const summary = summarizeTypes([
      entry('2026-01-05', 'Pull'),
      entry('2026-01-02', 'Push'),
      entry('2026-01-09', 'Push'),
    ]);
    expect(summary).toEqual([
      { type: 'Push', count: 2 },
      { type: 'Pull', count: 1 },
    ]);
  });
});

describe('colorForType', () => {
  const types = ['Push', 'Pull', 'Beine'];

  it('gibt jeder Art eine eigene Farbe', () => {
    const colors = types.map((type) => colorForType(types, type));
    expect(new Set(colors).size).toBe(3);
  });

  it('bleibt stabil, wenn eine Art dazukommt', () => {
    const before = colorForType(types, 'Pull');
    expect(colorForType([...types, 'Cardio'], 'Pull')).toBe(before);
  });

  it('faellt bei unbekannter Art auf die erste Farbe zurueck', () => {
    expect(colorForType(types, 'Unbekannt')).toBe(colorForType(types, 'Push'));
  });

  it('wiederholt die Farben bei vielen Arten', () => {
    const many = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    expect(colorForType(many, 'g')).toBe(colorForType(many, 'a'));
  });
});

describe('yearsWithData', () => {
  it('enthaelt immer das laufende Jahr', () => {
    expect(yearsWithData([], '2026-09-25')).toEqual([2026]);
  });

  it('sortiert die neuesten Jahre nach oben', () => {
    expect(yearsWithData(['2024-05-01', '2026-01-01', '2025-07-07'], '2026-09-25')).toEqual([
      2026, 2025, 2024,
    ]);
  });
});
