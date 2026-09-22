import { describe, expect, it } from 'vitest';
import type { WeightEntry } from '../db/types';
import { filterByRange, movingAverage, weightStats } from './weight';

function entry(day: string, weight: number): WeightEntry {
  return { day, weight, updatedAt: 0 };
}

describe('filterByRange', () => {
  const entries = [
    entry('2026-09-01', 110),
    entry('2026-09-16', 109),
    entry('2026-09-20', 108.6),
    entry('2026-09-22', 108.4),
  ];

  it('gibt bei "Alle" alles zurueck', () => {
    expect(filterByRange(entries, 'all', '2026-09-22')).toHaveLength(4);
  });

  it('beschraenkt auf die letzten sieben Tage einschliesslich heute', () => {
    // Fenster ist der 16.09. bis 22.09.
    const result = filterByRange(entries, '7d', '2026-09-22');
    expect(result.map((item) => item.day)).toEqual([
      '2026-09-16',
      '2026-09-20',
      '2026-09-22',
    ]);
  });

  it('schliesst den Tag vor dem Fenster aus', () => {
    const result = filterByRange([entry('2026-09-15', 112)], '7d', '2026-09-22');
    expect(result).toEqual([]);
  });

  it('beschraenkt auf 30 Tage', () => {
    const result = filterByRange(entries, '30d', '2026-09-22');
    expect(result.map((item) => item.day)).toEqual([
      '2026-09-01',
      '2026-09-16',
      '2026-09-20',
      '2026-09-22',
    ]);
  });

  it('liefert eine leere Liste, wenn nichts im Zeitraum liegt', () => {
    expect(filterByRange([entry('2025-01-01', 100)], '7d', '2026-09-22')).toEqual([]);
  });

  it('veraendert die Eingabeliste nicht', () => {
    const input = [entry('2026-09-22', 108)];
    filterByRange(input, 'all', '2026-09-22');
    expect(input).toHaveLength(1);
  });
});

describe('movingAverage', () => {
  it('gibt fuer eine leere Liste nichts zurueck', () => {
    expect(movingAverage([])).toEqual([]);
  });

  it('nimmt beim ersten Punkt den Wert selbst', () => {
    const points = movingAverage([entry('2026-09-22', 108)]);
    expect(points[0]?.average).toBe(108);
  });

  it('mittelt ueber die letzten sieben Kalendertage', () => {
    const points = movingAverage([
      entry('2026-09-20', 110),
      entry('2026-09-21', 108),
      entry('2026-09-22', 106),
    ]);
    expect(points[2]?.average).toBeCloseTo(108, 10);
  });

  it('laesst Messungen ausserhalb des Fensters weg', () => {
    const points = movingAverage([
      entry('2026-09-01', 120),
      entry('2026-09-21', 108),
      entry('2026-09-22', 106),
    ]);
    expect(points[2]?.average).toBeCloseTo(107, 10);
  });

  it('sortiert unsortierte Eingaben', () => {
    const points = movingAverage([entry('2026-09-22', 106), entry('2026-09-21', 108)]);
    expect(points.map((point) => point.day)).toEqual(['2026-09-21', '2026-09-22']);
  });
});

describe('weightStats', () => {
  it('gibt ohne Eintraege null zurueck', () => {
    expect(weightStats([])).toBeNull();
  });

  it('berechnet Spanne und Veraenderung', () => {
    const stats = weightStats([
      entry('2026-09-01', 110),
      entry('2026-09-22', 108.4),
      entry('2026-09-10', 111.2),
    ]);

    expect(stats?.first.weight).toBe(110);
    expect(stats?.last.weight).toBe(108.4);
    expect(stats?.min).toBe(108.4);
    expect(stats?.max).toBe(111.2);
    expect(stats?.change).toBeCloseTo(-1.6, 10);
  });
});
