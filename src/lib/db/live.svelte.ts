import { liveQuery } from 'dexie';

/**
 * Haelt das Ergebnis einer Dexie-Abfrage automatisch aktuell: jede Aenderung
 * an den beteiligten Tabellen aktualisiert den Wert.
 *
 * Haengt die Abfrage von reaktivem Zustand ab (z. B. dem gewaehlten Tag),
 * muss dieser ueber `deps` gelesen werden, damit neu abonniert wird.
 */
export function liveValue<T>(query: () => Promise<T>, initial: T, deps?: () => unknown) {
  /*
   * $state.raw statt $state: das Ergebnis wird immer komplett ersetzt, nie
   * einzeln veraendert. Ausserdem blieben die Datensaetze sonst Proxys, die
   * sich nicht zurueck in IndexedDB schreiben lassen (DataCloneError).
   */
  let value = $state.raw<T>(initial);

  $effect(() => {
    deps?.();
    const subscription = liveQuery(query).subscribe({
      next: (next) => {
        value = next;
      },
      error: (error: unknown) => {
        console.error('Datenbankabfrage fehlgeschlagen', error);
      },
    });
    return () => subscription.unsubscribe();
  });

  return {
    get current(): T {
      return value;
    },
  };
}
