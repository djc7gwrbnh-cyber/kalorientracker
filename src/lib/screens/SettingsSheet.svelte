<script lang="ts">
  import FormGroup from '../components/FormGroup.svelte';
  import ProfileFields from '../components/ProfileFields.svelte';
  import Sheet from '../components/Sheet.svelte';
  import { countBackup, parseBackup, backupFileName } from '../backup/format';
  import { exportBackupFile } from '../backup/transfer';
  import { createBackup, restoreBackup } from '../db/backup';
  import { toProfileDraft, toProfileInput, type ProfileDraft } from '../db/profile';
  import { profileStore } from '../stores/profile.svelte';

  let { open = $bindable() }: { open: boolean } = $props();

  let draft = $state<ProfileDraft>(toProfileDraft(profileStore.current));
  let status = $state<{ kind: 'info' | 'error'; text: string } | null>(null);
  let busy = $state(false);
  let fileInput = $state<HTMLInputElement>();

  // Beim Oeffnen immer die gespeicherten Werte zeigen.
  $effect(() => {
    if (open) {
      draft = toProfileDraft(profileStore.current);
      status = null;
    }
  });

  const input = $derived(toProfileInput(draft));

  async function save() {
    if (!input) return;
    await profileStore.save(input);
    open = false;
  }

  async function exportBackup() {
    if (busy) return;
    busy = true;
    status = null;
    try {
      const backup = await createBackup();
      const result = await exportBackupFile(JSON.stringify(backup, null, 2), backupFileName());
      status = {
        kind: 'info',
        text:
          result === 'shared'
            ? 'Backup zum Teilen bereitgestellt.'
            : 'Backup wurde heruntergeladen.',
      };
    } catch {
      status = { kind: 'error', text: 'Der Export hat nicht geklappt.' };
    } finally {
      busy = false;
    }
  }

  async function importBackup(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const file = target.files?.[0];
    // Zuruecksetzen, damit dieselbe Datei erneut gewaehlt werden kann.
    target.value = '';
    if (!file || busy) return;

    busy = true;
    status = null;
    try {
      const result = parseBackup(await file.text());
      if (!result.ok) {
        status = { kind: 'error', text: result.error };
        return;
      }

      const counts = countBackup(result.backup);
      const plural = (count: number, one: string, many: string) =>
        `${count} ${count === 1 ? one : many}`;
      const summary = [
        plural(counts.foods, 'Lebensmittel', 'Lebensmittel'),
        plural(counts.meals, 'Mahlzeit', 'Mahlzeiten'),
        plural(counts.entries, 'Eintrag', 'Einträge'),
        plural(counts.weights, 'Gewichtswert', 'Gewichtswerte'),
      ].join(', ');

      const sure = confirm(
        `Backup einspielen?\n\nEnthalten: ${summary}.\n\nDeine aktuellen Daten werden dabei vollständig ersetzt.`,
      );
      if (!sure) return;

      await restoreBackup(result.backup);
      await profileStore.load();
      status = { kind: 'info', text: 'Backup wurde eingespielt.' };
    } catch {
      status = { kind: 'error', text: 'Die Datei konnte nicht gelesen werden.' };
    } finally {
      busy = false;
    }
  }
</script>

<Sheet bind:open title="Einstellungen" confirmLabel="Fertig" confirmDisabled={!input} onconfirm={save}>
  <ProfileFields
    bind:height={draft.height}
    bind:calorieGoal={draft.calorieGoal}
    bind:proteinGoal={draft.proteinGoal}
    bind:fatGoal={draft.fatGoal}
    bind:carbGoal={draft.carbGoal}
  />

  <section>
    <FormGroup
      title="Backup"
      footer="Der Export ist eine JSON-Datei, die du über das Teilen-Menü in der Dateien-App sichern kannst."
    >
      <button type="button" class="action" disabled={busy} onclick={exportBackup}>
        Backup exportieren
      </button>
      <button type="button" class="action" disabled={busy} onclick={() => fileInput?.click()}>
        Backup importieren
      </button>
    </FormGroup>

    <input
      bind:this={fileInput}
      type="file"
      accept="application/json,.json"
      class="visually-hidden"
      onchange={importBackup}
    />

    {#if status}
      <p class="status" class:error={status.kind === 'error'} role="status">{status.text}</p>
    {/if}
  </section>

  <section>
    <p class="section-title">Deine Daten</p>
    <div class="card">
      <p>
        Alle Einträge liegen ausschließlich auf diesem iPhone – ohne Konto, ohne Server. Wenn du
        die App vom Home-Bildschirm entfernst, werden sie mit gelöscht. Sichere dir deshalb
        gelegentlich ein Backup.
      </p>
    </div>
  </section>
</Sheet>

<style>
  section {
    margin-top: 22px;
  }

  .action {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: var(--tap);
    padding: 10px 16px;
    color: var(--accent);
    text-align: left;
  }

  .action:active:not(:disabled) {
    background: var(--fill);
  }

  .action:disabled {
    opacity: 0.5;
  }

  .status {
    margin: 10px 4px 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--text-2);
  }

  .status.error {
    color: var(--danger);
  }

  .card p {
    margin: 0;
    font-size: 15px;
    line-height: 1.45;
    color: var(--text-2);
  }
</style>
