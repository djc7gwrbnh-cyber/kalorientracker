export type Tab = 'today' | 'history' | 'library' | 'weight';

export const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Heute' },
  { id: 'history', label: 'Verlauf' },
  { id: 'library', label: 'Bibliothek' },
  { id: 'weight', label: 'Gewicht' },
];
