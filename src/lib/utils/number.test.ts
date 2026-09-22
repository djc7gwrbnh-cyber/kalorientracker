import { describe, expect, it } from 'vitest';
import { formatGrams, formatKcal, formatWeight, parseDecimal, toInputValue } from './number';

describe('parseDecimal', () => {
  it('liest beide Dezimaltrennzeichen', () => {
    expect(parseDecimal('108,4')).toBe(108.4);
    expect(parseDecimal('108.4')).toBe(108.4);
  });

  it('liest ganze Zahlen', () => {
    expect(parseDecimal('250')).toBe(250);
    expect(parseDecimal('0')).toBe(0);
  });

  it('ignoriert umgebende Leerzeichen', () => {
    expect(parseDecimal('  65 ')).toBe(65);
  });

  it('behandelt gemischte Separatoren als Tausender plus Dezimalzeichen', () => {
    expect(parseDecimal('1.850,5')).toBe(1850.5);
    expect(parseDecimal('1,850.5')).toBe(1850.5);
  });

  it('behandelt mehrfach denselben Separator als Tausendertrennung', () => {
    expect(parseDecimal('1.234.567')).toBe(1234567);
    expect(parseDecimal('1,234,567')).toBe(1234567);
  });

  it('erlaubt negative Werte', () => {
    expect(parseDecimal('-2,5')).toBe(-2.5);
  });

  it('gibt null fuer ungueltige Eingaben zurueck', () => {
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('   ')).toBeNull();
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('12 g')).toBeNull();
    expect(parseDecimal('.')).toBeNull();
    expect(parseDecimal(',')).toBeNull();
    expect(parseDecimal('-')).toBeNull();
  });
});

describe('Formatierung', () => {
  it('formatiert Kalorien mit Tausenderpunkt', () => {
    expect(formatKcal(1850)).toBe('1.850');
    expect(formatKcal(1850.4)).toBe('1.850');
    expect(formatKcal(0)).toBe('0');
  });

  it('formatiert Gramm ohne unnoetige Nachkommastelle', () => {
    expect(formatGrams(25)).toBe('25');
    expect(formatGrams(12.5)).toBe('12,5');
    expect(formatGrams(0.24)).toBe('0,2');
  });

  it('formatiert Gewicht mit genau einer Nachkommastelle', () => {
    expect(formatWeight(108.4)).toBe('108,4');
    expect(formatWeight(108)).toBe('108,0');
  });

  it('macht Zahlen wieder bearbeitbar', () => {
    expect(toInputValue(108.4)).toBe('108,4');
    expect(toInputValue(250)).toBe('250');
  });
});
