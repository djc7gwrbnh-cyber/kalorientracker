import type { WeightEntry } from '../db/types';
import { addDays, daysBetween } from '../utils/date';

export type WeightRange = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

export const WEIGHT_RANGES: { value: WeightRange; label: string; days: number | null }[] = [
  { value: '7d', label: '7 T', days: 7 },
  { value: '30d', label: '30 T', days: 30 },
  { value: '3m', label: '3 M', days: 90 },
  { value: '6m', label: '6 M', days: 180 },
  { value: '1y', label: '1 J', days: 365 },
  { value: 'all', label: 'Alle', days: null },
];

/** Beschraenkt die Eintraege auf den gewaehlten Zeitraum. */
export function filterByRange(
  entries: WeightEntry[],
  range: WeightRange,
  today: string,
): WeightEntry[] {
  const days = WEIGHT_RANGES.find((option) => option.value === range)?.days ?? null;
  if (days === null) return [...entries];

  const from = addDays(today, -(days - 1));
  return entries.filter((entry) => entry.day >= from);
}

export interface TrendPoint {
  day: string;
  /** Gleitender Durchschnitt der letzten 7 Kalendertage. */
  average: number;
}

/**
 * Gleitender 7-Tage-Durchschnitt ueber Kalendertage: fehlende Tage zaehlen
 * nicht mit, gemittelt wird ueber die tatsaechlich vorhandenen Messungen.
 */
export function movingAverage(entries: WeightEntry[], windowDays = 7): TrendPoint[] {
  const sorted = [...entries].sort((a, b) => a.day.localeCompare(b.day));

  return sorted.map((entry, index) => {
    let sum = 0;
    let count = 0;

    for (let previous = index; previous >= 0; previous -= 1) {
      const candidate = sorted[previous]!;
      if (daysBetween(candidate.day, entry.day) >= windowDays) break;
      sum += candidate.weight;
      count += 1;
    }

    return { day: entry.day, average: sum / count };
  });
}

export interface WeightStats {
  first: WeightEntry;
  last: WeightEntry;
  min: number;
  max: number;
  /** Veraenderung vom ersten zum letzten Eintrag im Zeitraum. */
  change: number;
}

export function weightStats(entries: WeightEntry[]): WeightStats | null {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) => a.day.localeCompare(b.day));
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  const weights = sorted.map((entry) => entry.weight);

  return {
    first,
    last,
    min: Math.min(...weights),
    max: Math.max(...weights),
    change: last.weight - first.weight,
  };
}
