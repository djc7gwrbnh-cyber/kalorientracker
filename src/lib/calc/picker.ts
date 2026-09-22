/** Gemeinsame Felder von Lebensmitteln und Mahlzeiten fuer die Auswahl. */
export interface Rankable {
  id: string;
  name: string;
  favorite: boolean;
  usageCount: number;
  lastUsedAt?: number;
}

export interface PickerSection<T> {
  title: string;
  items: T[];
}

function byName(a: Rankable, b: Rankable): number {
  return a.name.localeCompare(b.name, 'de');
}

/**
 * Gliedert die Auswahl in Favoriten, zuletzt und haeufig verwendet sowie den
 * Rest. Jeder Eintrag erscheint nur einmal, in der obersten passenden Gruppe.
 */
export function buildPickerSections<T extends Rankable>(
  items: T[],
  limit = 6,
): PickerSection<T>[] {
  const taken = new Set<string>();

  const take = (candidates: T[], max?: number): T[] => {
    const chosen = candidates.filter((item) => !taken.has(item.id)).slice(0, max);
    for (const item of chosen) taken.add(item.id);
    return chosen;
  };

  const favorites = take(
    items
      .filter((item) => item.favorite)
      .sort((a, b) => b.usageCount - a.usageCount || byName(a, b)),
  );

  const recent = take(
    items
      .filter((item) => item.lastUsedAt !== undefined)
      .sort((a, b) => (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0)),
    limit,
  );

  const frequent = take(
    items.filter((item) => item.usageCount > 0).sort((a, b) => b.usageCount - a.usageCount),
    limit,
  );

  const rest = take([...items].sort(byName));

  return [
    { title: 'Favoriten', items: favorites },
    { title: 'Zuletzt verwendet', items: recent },
    { title: 'Häufig verwendet', items: frequent },
    { title: 'Alle', items: rest },
  ].filter((section) => section.items.length > 0);
}
