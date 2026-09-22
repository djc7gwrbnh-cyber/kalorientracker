import { describe, expect, it } from 'vitest';
import { matchesQuery, normalizeText } from './search';

describe('normalizeText', () => {
  it('entfernt Gross-/Kleinschreibung und Umlautpunkte', () => {
    expect(normalizeText('Müsli')).toBe('musli');
    expect(normalizeText('Käse-Brötchen')).toBe('kase-brotchen');
  });
});

describe('matchesQuery', () => {
  it('findet Teilzeichenketten', () => {
    expect(matchesQuery('Haferflocken', 'hafer')).toBe(true);
    expect(matchesQuery('Haferflocken', 'flocken')).toBe(true);
    expect(matchesQuery('Haferflocken', 'reis')).toBe(false);
  });

  it('ignoriert Umlaute in beide Richtungen', () => {
    expect(matchesQuery('Müsli', 'musli')).toBe(true);
    expect(matchesQuery('Musli', 'müsli')).toBe(true);
  });

  it('verlangt alle Woerter, aber in beliebiger Reihenfolge', () => {
    expect(matchesQuery('Griechischer Joghurt 10%', 'joghurt griechisch')).toBe(true);
    expect(matchesQuery('Griechischer Joghurt 10%', 'joghurt magerquark')).toBe(false);
  });

  it('passt bei leerer Suche auf alles', () => {
    expect(matchesQuery('Skyr', '')).toBe(true);
    expect(matchesQuery('Skyr', '   ')).toBe(true);
  });
});
