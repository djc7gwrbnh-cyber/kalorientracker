/** Kleinschreibung ohne Akzente, damit "Musli" auch "Müsli" findet. */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Prueft, ob ein Text zur Suche passt. Mehrere Woerter muessen alle
 * vorkommen, ihre Reihenfolge spielt keine Rolle.
 */
export function matchesQuery(text: string, query: string): boolean {
  const parts = normalizeText(query).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return true;

  const haystack = normalizeText(text);
  return parts.every((part) => haystack.includes(part));
}
