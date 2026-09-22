import { describe, expect, it } from 'vitest';
import {
  addDays,
  daysBetween,
  describeDay,
  formatDayFull,
  formatDayShort,
  suggestCategory,
  toDayKey,
} from './date';

describe('Tagesschluessel', () => {
  it('nutzt die lokale Zeit, nicht UTC', () => {
    // 23:30 lokal gehoert noch zum selben Tag, auch wenn es in UTC schon
    // der naechste waere.
    expect(toDayKey(new Date(2026, 8, 22, 23, 30))).toBe('2026-09-22');
    expect(toDayKey(new Date(2026, 8, 22, 0, 15))).toBe('2026-09-22');
  });

  it('fuellt Monat und Tag auf zwei Stellen auf', () => {
    expect(toDayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('verschiebt ueber Monats- und Jahresgrenzen', () => {
    expect(addDays('2026-09-22', 1)).toBe('2026-09-23');
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('zaehlt Tage zwischen zwei Schluesseln', () => {
    expect(daysBetween('2026-09-22', '2026-09-22')).toBe(0);
    expect(daysBetween('2026-09-22', '2026-09-29')).toBe(7);
    expect(daysBetween('2026-09-29', '2026-09-22')).toBe(-7);
  });

  it('zaehlt auch ueber eine Zeitumstellung korrekt', () => {
    // In Deutschland endet die Sommerzeit am 25.10.2026.
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
  });
});

describe('Anzeige', () => {
  it('formatiert kurz und vollstaendig', () => {
    expect(formatDayShort('2026-09-22')).toBe('22.09.');
    expect(formatDayFull('2026-09-22')).toBe('22.09.2026');
  });

  it('benennt heute und gestern', () => {
    expect(describeDay('2026-09-22', '2026-09-22')).toBe('Heute');
    expect(describeDay('2026-09-21', '2026-09-22')).toBe('Gestern');
    expect(describeDay('2026-09-20', '2026-09-22')).toBe('Sonntag, 20. September');
  });
});

describe('suggestCategory', () => {
  it('schlaegt nach Uhrzeit vor', () => {
    expect(suggestCategory(new Date(2026, 8, 22, 8, 0))).toBe('breakfast');
    expect(suggestCategory(new Date(2026, 8, 22, 12, 30))).toBe('lunch');
    expect(suggestCategory(new Date(2026, 8, 22, 19, 0))).toBe('dinner');
    expect(suggestCategory(new Date(2026, 8, 22, 15, 30))).toBe('snack');
    expect(suggestCategory(new Date(2026, 8, 22, 23, 0))).toBe('snack');
    expect(suggestCategory(new Date(2026, 8, 22, 2, 0))).toBe('snack');
  });
});
