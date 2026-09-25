<script lang="ts">
  import DateField from '../components/DateField.svelte';
  import FormGroup from '../components/FormGroup.svelte';
  import Sheet from '../components/Sheet.svelte';
  import TextField from '../components/TextField.svelte';
  import { colorForType } from '../calc/workouts';
  import type { WorkoutEntry } from '../db/types';
  import { deleteWorkout, setWorkout } from '../db/workouts';
  import { todayKey } from '../utils/date';

  let {
    open = $bindable(),
    day = todayKey(),
    entry = null,
    knownTypes = [],
  }: {
    open: boolean;
    /** Vorgewaehlter Tag, wenn noch nichts eingetragen ist. */
    day?: string;
    entry?: WorkoutEntry | null;
    /** Bereits verwendete Trainingsarten als Schnellauswahl. */
    knownTypes?: string[];
  } = $props();

  let editDay = $state(todayKey());
  let type = $state('');
  let note = $state('');
  let originalDay = $state<string | null>(null);

  $effect(() => {
    if (open) {
      editDay = entry?.day ?? day;
      type = entry?.type ?? '';
      note = entry?.note ?? '';
      originalDay = entry?.day ?? null;
    }
  });

  const canSave = $derived(type.trim().length > 0 && editDay !== '');

  async function save() {
    if (!canSave) return;

    await setWorkout(editDay, type, note);
    // Beim Verschieben auf einen anderen Tag bleibt sonst der alte stehen.
    if (originalDay && originalDay !== editDay) await deleteWorkout(originalDay);
    open = false;
  }

  async function remove() {
    if (!originalDay) return;
    await deleteWorkout(originalDay);
    open = false;
  }
</script>

<Sheet
  bind:open
  title={entry ? 'Training' : 'Training eintragen'}
  confirmLabel="Sichern"
  confirmDisabled={!canSave}
  onconfirm={save}
>
  <FormGroup footer="Pro Tag wird eine Einheit gespeichert – eine neue ersetzt die alte.">
    <DateField label="Datum" bind:value={editDay} />
    <TextField label="Training" bind:value={type} placeholder="z. B. Push" />
    <TextField label="Notiz" bind:value={note} placeholder="optional" />
  </FormGroup>

  {#if knownTypes.length > 0}
    <div class="chips">
      {#each knownTypes as known (known)}
        <button
          type="button"
          class="chip"
          class:on={type.trim() === known}
          onclick={() => (type = known)}
        >
          <span class="dot" style:background={colorForType(knownTypes, known)}></span>
          {known}
        </button>
      {/each}
    </div>
  {/if}

  {#if entry}
    <button type="button" class="btn btn-danger" onclick={remove}>Eintrag löschen</button>
  {/if}
</Sheet>

<style>
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .chip {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 38px;
    padding: 0 14px;
    border-radius: var(--radius-pill);
    background: var(--fill);
    font-size: 15px;
  }

  .chip.on {
    background: var(--fill-strong);
    font-weight: 600;
  }

  .chip:active {
    opacity: 0.6;
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }

  .btn {
    width: 100%;
    margin-top: 22px;
  }
</style>
