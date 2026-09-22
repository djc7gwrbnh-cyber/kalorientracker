/**
 * Bittet den Browser, die lokalen Daten dauerhaft zu speichern, damit iOS sie
 * nicht bei Speicherdruck verwirft. Schlaegt die Anfrage fehl, laeuft die App
 * unveraendert weiter.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
