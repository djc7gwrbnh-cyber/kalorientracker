import type { WorkoutEntry } from '../db/types';
import { addDays, daysBetween, fromDayKey, toDayKey } from '../utils/date';

export interface GridCell {
  day: string;
  /** Spalte: Kalenderwoche seit Jahresbeginn. */
  weekIndex: number;
  /** Zeile: 0 = Montag bis 6 = Sonntag. */
  weekday: number;
}

export interface MonthLabel {
  /** 0 = Januar. */
  month: number;
  weekIndex: number;
}

export interface YearGrid {
  year: number;
  weeks: number;
  cells: GridCell[];
  monthLabels: MonthLabel[];
}

/** Montag = 0, damit die Woche wie im deutschen Kalender beginnt. */
function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Baut das Jahresraster: eine Spalte je Kalenderwoche, eine Zeile je
 * Wochentag. Tage vor dem 1. Januar bleiben leer, die Spalte beginnt trotzdem
 * am Montag.
 */
export function buildYearGrid(year: number): YearGrid {
  const firstDay = new Date(year, 0, 1);
  // Montag der Woche, in der das Jahr beginnt.
  const gridStart = toDayKey(addDaysToDate(firstDay, -weekdayIndex(firstDay)));

  const cells: GridCell[] = [];
  const monthLabels: MonthLabel[] = [];
  let seenMonth = -1;

  let day = toDayKey(firstDay);
  const lastDay = toDayKey(new Date(year, 11, 31));

  while (day <= lastDay) {
    const date = fromDayKey(day);
    const weekIndex = Math.floor(daysBetween(gridStart, day) / 7);

    cells.push({ day, weekIndex, weekday: weekdayIndex(date) });

    if (date.getMonth() !== seenMonth) {
      seenMonth = date.getMonth();
      monthLabels.push({ month: seenMonth, weekIndex });
    }

    day = addDays(day, 1);
  }

  const weeks = (cells[cells.length - 1]?.weekIndex ?? 0) + 1;
  return { year, weeks, cells, monthLabels };
}

function addDaysToDate(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

export interface WorkoutStats {
  /** Einheiten im Jahr. */
  total: number;
  /** Einheiten in der laufenden Kalenderwoche (Montag bis Sonntag). */
  thisWeek: number;
  /** Durchschnitt pro Woche seit der ersten Einheit des Jahres. */
  perWeek: number;
}

/** Montag der Woche, in der der Tag liegt. */
export function startOfWeek(day: string): string {
  return addDays(day, -weekdayIndex(fromDayKey(day)));
}

export function workoutStats(days: string[], year: number, today: string): WorkoutStats {
  const inYear = days.filter((day) => day.startsWith(`${year}-`)).sort();
  if (inYear.length === 0) return { total: 0, thisWeek: 0, perWeek: 0 };

  const weekStart = startOfWeek(today);
  const thisWeek = inYear.filter((day) => day >= weekStart && day <= addDays(weekStart, 6)).length;

  // Bis heute rechnen, damit ein angefangenes Jahr nicht kleingerechnet wird.
  // Mindestens eine Woche, sonst ergaebe ein einzelner Eintrag "7 pro Woche".
  const first = inYear[0]!;
  const last = today.startsWith(`${year}-`) ? today : `${year}-12-31`;
  const spanDays = Math.max(daysBetween(first, last) + 1, 7);
  const perWeek = (inYear.length / spanDays) * 7;

  return { total: inYear.length, thisWeek, perWeek };
}

export interface TypeSummary {
  type: string;
  count: number;
}

/**
 * Trainingsarten in der Reihenfolge ihres ersten Auftretens. Dadurch bleibt
 * die Farbzuordnung stabil, auch wenn neue Arten dazukommen.
 */
export function summarizeTypes(entries: WorkoutEntry[]): TypeSummary[] {
  const order: string[] = [];
  const counts = new Map<string, number>();

  for (const entry of [...entries].sort((a, b) => a.day.localeCompare(b.day))) {
    if (!counts.has(entry.type)) {
      counts.set(entry.type, 0);
      order.push(entry.type);
    }
    counts.set(entry.type, (counts.get(entry.type) ?? 0) + 1);
  }

  return order.map((type) => ({ type, count: counts.get(type) ?? 0 }));
}

/** Farbtoken je Trainingsart; wiederholt sich bei mehr als sechs Arten. */
export const TYPE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
];

export function colorForType(types: string[], type: string): string {
  const index = types.indexOf(type);
  if (index < 0) return TYPE_COLORS[0]!;
  return TYPE_COLORS[index % TYPE_COLORS.length]!;
}

/** Jahre mit Eintraegen, neueste zuerst; das laufende Jahr ist immer dabei. */
export function yearsWithData(days: string[], today: string): number[] {
  const currentYear = Number(today.slice(0, 4));
  const years = new Set<number>([currentYear]);
  for (const day of days) years.add(Number(day.slice(0, 4)));
  return [...years].sort((a, b) => b - a);
}
