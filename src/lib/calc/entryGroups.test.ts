import { describe, expect, it } from 'vitest';
import type { FoodEntry } from '../db/types';
import { groupEntries } from './entryGroups';

function entry(id: string, overrides: Partial<FoodEntry> = {}): FoodEntry {
  return {
    id,
    timestamp: Number(id.replace(/\D/g, '')) || 0,
    day: '2026-09-22',
    category: 'breakfast',
    amount: 100,
    name: `Essen ${id}`,
    per100: { kcal: 100, protein: 10, fat: 5, carbs: 10 },
    unit: 'g',
    ...overrides,
  };
}

describe('groupEntries', () => {
  it('gibt fuer eine leere Liste nichts zurueck', () => {
    expect(groupEntries([])).toEqual([]);
  });

  it('laesst einzelne Eintraege einzeln', () => {
    const groups = groupEntries([entry('e1'), entry('e2')]);
    expect(groups.map((group) => group.kind)).toEqual(['single', 'single']);
  });

  it('fasst Eintraege derselben Mahlzeit zusammen', () => {
    const groups = groupEntries([
      entry('e1', { mealGroupId: 'g1', mealName: 'Skyr Bowl' }),
      entry('e2', { mealGroupId: 'g1', mealName: 'Skyr Bowl' }),
      entry('e3'),
    ]);

    expect(groups).toHaveLength(2);
    const [first] = groups;
    expect(first?.kind).toBe('meal');
    if (first?.kind === 'meal') {
      expect(first.name).toBe('Skyr Bowl');
      expect(first.entries).toHaveLength(2);
    }
  });

  it('haelt verschiedene Mahlzeiten auseinander', () => {
    const groups = groupEntries([
      entry('e1', { mealGroupId: 'g1', mealName: 'Bowl' }),
      entry('e2', { mealGroupId: 'g2', mealName: 'Salat' }),
      entry('e3', { mealGroupId: 'g1', mealName: 'Bowl' }),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups.map((group) => (group.kind === 'meal' ? group.entries.length : 0))).toEqual([
      2, 1,
    ]);
  });

  it('behaelt die Reihenfolge des ersten Eintrags der Gruppe', () => {
    const groups = groupEntries([
      entry('e1'),
      entry('e2', { mealGroupId: 'g1', mealName: 'Bowl' }),
      entry('e3'),
    ]);
    expect(groups.map((group) => group.key)).toEqual(['e1', 'g1', 'e3']);
  });

  it('nutzt einen Ersatznamen, wenn der Mahlzeitname fehlt', () => {
    const groups = groupEntries([entry('e1', { mealGroupId: 'g1' })]);
    expect(groups[0]?.kind === 'meal' && groups[0].name).toBe('Mahlzeit');
  });
});
