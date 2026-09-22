import { describe, expect, it } from 'vitest';
import { buildPickerSections, type Rankable } from './picker';

function item(overrides: Partial<Rankable> & { id: string; name: string }): Rankable {
  return { favorite: false, usageCount: 0, ...overrides };
}

const titles = (sections: { title: string }[]) => sections.map((section) => section.title);
const names = (sections: { title: string; items: Rankable[] }[], title: string) =>
  sections.find((section) => section.title === title)?.items.map((entry) => entry.name);

describe('buildPickerSections', () => {
  it('gibt fuer eine leere Liste keine Gruppen zurueck', () => {
    expect(buildPickerSections([])).toEqual([]);
  });

  it('zeigt nur Gruppen, die etwas enthalten', () => {
    const sections = buildPickerSections([item({ id: '1', name: 'Skyr' })]);
    expect(titles(sections)).toEqual(['Alle']);
  });

  it('stellt Favoriten nach vorne', () => {
    const sections = buildPickerSections([
      item({ id: '1', name: 'Apfel' }),
      item({ id: '2', name: 'Skyr', favorite: true }),
    ]);
    expect(titles(sections)).toEqual(['Favoriten', 'Alle']);
    expect(names(sections, 'Favoriten')).toEqual(['Skyr']);
    expect(names(sections, 'Alle')).toEqual(['Apfel']);
  });

  it('sortiert Favoriten nach Haeufigkeit', () => {
    const sections = buildPickerSections([
      item({ id: '1', name: 'Apfel', favorite: true, usageCount: 2 }),
      item({ id: '2', name: 'Skyr', favorite: true, usageCount: 9 }),
    ]);
    expect(names(sections, 'Favoriten')).toEqual(['Skyr', 'Apfel']);
  });

  it('sortiert zuletzt verwendet nach Zeitpunkt', () => {
    const sections = buildPickerSections([
      item({ id: '1', name: 'Alt', usageCount: 1, lastUsedAt: 1000 }),
      item({ id: '2', name: 'Neu', usageCount: 1, lastUsedAt: 5000 }),
    ]);
    expect(names(sections, 'Zuletzt verwendet')).toEqual(['Neu', 'Alt']);
  });

  it('zeigt jeden Eintrag nur einmal', () => {
    const sections = buildPickerSections([
      item({ id: '1', name: 'Skyr', favorite: true, usageCount: 5, lastUsedAt: 9000 }),
    ]);
    expect(titles(sections)).toEqual(['Favoriten']);
  });

  it('trennt haeufig von zuletzt verwendet', () => {
    const sections = buildPickerSections([
      item({ id: '1', name: 'Frisch', usageCount: 1, lastUsedAt: 9000 }),
      item({ id: '2', name: 'Oft', usageCount: 40 }),
    ]);
    expect(names(sections, 'Zuletzt verwendet')).toEqual(['Frisch']);
    expect(names(sections, 'Häufig verwendet')).toEqual(['Oft']);
  });

  it('begrenzt die Kurzlisten', () => {
    const many = Array.from({ length: 10 }, (_, index) =>
      item({ id: `f${index}`, name: `Essen ${index}`, usageCount: 1, lastUsedAt: index }),
    );
    const sections = buildPickerSections(many, 3);
    expect(names(sections, 'Zuletzt verwendet')).toHaveLength(3);
    expect(names(sections, 'Häufig verwendet')).toHaveLength(3);
    expect(names(sections, 'Alle')).toHaveLength(4);
  });

  it('sortiert die Restliste alphabetisch', () => {
    const sections = buildPickerSections([
      item({ id: '1', name: 'Zwiebel' }),
      item({ id: '2', name: 'Äpfel' }),
      item({ id: '3', name: 'Brot' }),
    ]);
    expect(names(sections, 'Alle')).toEqual(['Äpfel', 'Brot', 'Zwiebel']);
  });
});
