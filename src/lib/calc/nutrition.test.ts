import { describe, expect, it } from 'vitest';
import type { Nutrients } from '../db/types';
import {
  ZERO_NUTRIENTS,
  addNutrients,
  entryNutrients,
  scaleNutrients,
  sumEntries,
  sumNutrients,
} from './nutrition';

const beispiel: Nutrients = { kcal: 200, protein: 20, fat: 10, carbs: 5 };
const skyr: Nutrients = { kcal: 65, protein: 11, fat: 0.2, carbs: 4 };

describe('scaleNutrients', () => {
  it('rechnet die Menge aus der Aufgabenstellung korrekt hoch', () => {
    expect(scaleNutrients(beispiel, 250)).toEqual({
      kcal: 500,
      protein: 50,
      fat: 25,
      carbs: 12.5,
    });
  });

  it('laesst 100 g unveraendert', () => {
    expect(scaleNutrients(beispiel, 100)).toEqual(beispiel);
  });

  it('rechnet kleine Mengen ohne Rundung', () => {
    expect(scaleNutrients(skyr, 300)).toEqual({
      kcal: 195,
      protein: 33,
      fat: 0.6000000000000001,
      carbs: 12,
    });
  });

  it('ergibt bei Menge 0 ueberall 0', () => {
    expect(scaleNutrients(beispiel, 0)).toEqual(ZERO_NUTRIENTS);
  });
});

describe('addNutrients', () => {
  it('addiert feldweise', () => {
    expect(addNutrients(beispiel, skyr)).toEqual({
      kcal: 265,
      protein: 31,
      fat: 10.2,
      carbs: 9,
    });
  });

  it('summiert eine leere Liste zu null', () => {
    expect(sumNutrients([])).toEqual(ZERO_NUTRIENTS);
  });
});

describe('Eintraege', () => {
  it('nutzt den Snapshot des Eintrags', () => {
    expect(entryNutrients({ per100: beispiel, amount: 250 })).toEqual({
      kcal: 500,
      protein: 50,
      fat: 25,
      carbs: 12.5,
    });
  });

  it('summiert mehrere Eintraege', () => {
    const total = sumEntries([
      { per100: skyr, amount: 300 },
      { per100: beispiel, amount: 50 },
    ]);
    expect(total.kcal).toBeCloseTo(295, 10);
    expect(total.protein).toBeCloseTo(43, 10);
    expect(total.fat).toBeCloseTo(5.6, 10);
    expect(total.carbs).toBeCloseTo(14.5, 10);
  });

  it('bleibt bei keinem Eintrag bei null', () => {
    expect(sumEntries([])).toEqual(ZERO_NUTRIENTS);
  });
});
