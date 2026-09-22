<script lang="ts">
  import DateField from '../components/DateField.svelte';
  import FormGroup from '../components/FormGroup.svelte';
  import NumberField from '../components/NumberField.svelte';
  import Sheet from '../components/Sheet.svelte';
  import { deleteWeight, setWeight } from '../db/weights';
  import type { WeightEntry } from '../db/types';
  import { todayKey } from '../utils/date';

  let {
    open = $bindable(),
    entry = null,
  }: {
    open: boolean;
    /** null legt einen neuen Eintrag fuer heute an. */
    entry?: WeightEntry | null;
  } = $props();

  let day = $state(todayKey());
  let weight = $state<number | null>(null);
  let originalDay = $state<string | null>(null);

  $effect(() => {
    if (open) {
      day = entry?.day ?? todayKey();
      weight = entry?.weight ?? null;
      originalDay = entry?.day ?? null;
    }
  });

  const canSave = $derived(weight !== null && weight > 0 && day !== '');

  async function save() {
    if (weight === null || weight <= 0 || !day) return;

    await setWeight(day, weight);
    // Beim Verschieben auf einen anderen Tag bleibt sonst der alte stehen.
    if (originalDay && originalDay !== day) await deleteWeight(originalDay);
    open = false;
  }

  async function remove() {
    if (!originalDay) return;
    await deleteWeight(originalDay);
    open = false;
  }
</script>

<Sheet
  bind:open
  title={entry ? 'Gewicht' : 'Gewicht eintragen'}
  confirmLabel="Sichern"
  confirmDisabled={!canSave}
  onconfirm={save}
>
  <FormGroup footer="Pro Tag wird ein Wert gespeichert – ein neuer ersetzt den alten.">
    <DateField label="Datum" bind:value={day} max={todayKey()} />
    <NumberField
      label="Gewicht"
      bind:value={weight}
      unit="kg"
      placeholder="80,0"
      decimal
      selectOnFocus
    />
  </FormGroup>

  {#if entry}
    <button type="button" class="btn btn-danger" onclick={remove}>Eintrag löschen</button>
  {/if}
</Sheet>

<style>
  .btn {
    width: 100%;
    margin-top: 22px;
  }
</style>
