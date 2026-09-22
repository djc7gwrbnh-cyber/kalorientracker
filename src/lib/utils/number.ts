/**
 * Liest eine Zahl aus einer Nutzereingabe. Deutsches und englisches Format
 * funktionieren beide: "108,4" und "108.4" ergeben denselben Wert.
 * Gibt null zurueck, wenn die Eingabe keine Zahl ist.
 */
export function parseDecimal(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (!/^-?[\d.,]+$/.test(trimmed)) return null;

  const hasComma = trimmed.includes(',');
  const hasDot = trimmed.includes('.');

  let normalized: string;
  if (hasComma && hasDot) {
    // Gemischt: der hintere Separator ist das Dezimalzeichen ("1.850,5").
    const decimal = trimmed.lastIndexOf(',') > trimmed.lastIndexOf('.') ? ',' : '.';
    const thousands = decimal === ',' ? '.' : ',';
    normalized = trimmed.split(thousands).join('').replace(decimal, '.');
  } else if (hasComma || hasDot) {
    const separator = hasComma ? ',' : '.';
    const occurrences = trimmed.split(separator).length - 1;
    // Mehrfach vorhanden heisst Tausendertrennung ("1.234.567").
    normalized =
      occurrences > 1 ? trimmed.split(separator).join('') : trimmed.replace(separator, '.');
  } else {
    normalized = trimmed;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(min: number, max: number): Intl.NumberFormat {
  const key = `${min}-${max}`;
  let found = formatters.get(key);
  if (!found) {
    found = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: min,
      maximumFractionDigits: max,
    });
    formatters.set(key, found);
  }
  return found;
}

/** Ganze Zahl mit Tausenderpunkt, z. B. 1850 -> "1.850". */
export function formatKcal(value: number): string {
  return formatter(0, 0).format(Math.round(value));
}

/**
 * Gramm-Angabe mit hoechstens einer Nachkommastelle; ganze Werte bleiben
 * ohne Komma ("25" statt "25,0").
 */
export function formatGrams(value: number): string {
  return formatter(0, 1).format(value);
}

/** Gewicht mit genau einer Nachkommastelle, z. B. "108,4". */
export function formatWeight(value: number): string {
  return formatter(1, 1).format(value);
}

/** Wandelt eine Zahl in eine bearbeitbare Eingabe im deutschen Format. */
export function toInputValue(value: number): string {
  return String(value).replace('.', ',');
}
