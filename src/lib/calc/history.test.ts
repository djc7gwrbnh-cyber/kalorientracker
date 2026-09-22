import { describe, expect, it } from 'vitest';
import type { FoodEntry } from '../db/types';
import { summarizeDays } from './history';

function entry(day: string, amount: number, id = `${day}-${amount}`): FoodEntry {
  return {
    id,
    timestamp: 0,
    day,
    category: 'breakfast',
    amount,
    name: 'Test',
    per100: { kcal: 100, protein: 10, fat: 5, carbs: 20 },
    unit: 'g',
  };
}

describe('summarizeDays', () => {
  it('gibt fuer keine Eintraege nichts zurueck', () => {
    expect(summarizeDays([])).toEqual([]);
  });

  it('summiert je Tag', () => {
    const summaries = summarizeDays([
      entry('2026-09-22', 100),
      entry('2026-09-22', 250),
      entry('2026-09-21', 50),
    ]);

    expect(summaries).toHaveLength(2);
    expect(summaries[0]?.day).toBe('2026-09-22');
    expect(summaries[0]?.totals.kcal).toBe(350);
    expect(summaries[0]?.count).toBe(2);
    expect(summaries[1]?.totals.kcal).toBe(50);
  });

  it('sortiert die neuesten Tage nach oben', () => {
    const summaries = summarizeDays([
      entry('2026-09-20', 100),
      entry('2026-10-01', 100),
      entry('2026-09-30', 100),
    ]);
    expect(summaries.map((summary) => summary.day)).toEqual([
      '2026-10-01',
      '2026-09-30',
      '2026-09-20',
    ]);
  });

  it('summiert alle Naehrwerte, nicht nur Kalorien', () => {
    const [summary] = summarizeDays([entry('2026-09-22', 200)]);
    expect(summary?.totals).toEqual({ kcal: 200, protein: 20, fat: 10, carbs: 40 });
  });
});
