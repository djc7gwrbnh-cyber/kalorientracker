export type Tab = 'today' | 'training' | 'history' | 'library' | 'weight';

export const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Heute' },
  { id: 'training', label: 'Training' },
  { id: 'history', label: 'Verlauf' },
  { id: 'library', label: 'Bibliothek' },
  { id: 'weight', label: 'Gewicht' },
];
