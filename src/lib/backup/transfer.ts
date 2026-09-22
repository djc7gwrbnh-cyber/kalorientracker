export type ExportResult = 'shared' | 'downloaded';

function download(text: string, fileName: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Gibt das Backup weiter: auf dem iPhone ueber das Teilen-Menue (dort
 * "In Dateien sichern"), sonst als normaler Download.
 */
export async function exportBackupFile(text: string, fileName: string): Promise<ExportResult> {
  const file = new File([text], fileName, { type: 'application/json' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Kalorientracker-Backup' });
      return 'shared';
    } catch (error) {
      // Ein Abbruch durch den Nutzer ist kein Fehler und braucht keinen Download.
      if (error instanceof DOMException && error.name === 'AbortError') return 'shared';
    }
  }

  download(text, fileName);
  return 'downloaded';
}
