<script lang="ts">
  import FormGroup from '../components/FormGroup.svelte';
  import NumberField from '../components/NumberField.svelte';
  import NutrientSummary from '../components/NutrientSummary.svelte';
  import SegmentedControl from '../components/SegmentedControl.svelte';
  import Sheet from '../components/Sheet.svelte';
  import { scaleNutrients } from '../calc/nutrition';
  import { deleteEntries, updateEntry } from '../db/entries';
  import type { FoodEntry, MealCategory } from '../db/types';
  import { CATEGORY_ORDER, CATEGORY_SHORT_LABELS } from '../utils/date';

  let {
    open = $bindable(),
    entry = null,
  }: {
    open: boolean;
    entry?: FoodEntry | null;
  } = $props();

  let amount = $state<number | null>(null);
  let category = $state<MealCategory>('breakfast');

  $effect(() => {
    if (open && entry) {
      amount = entry.amount;
      category = entry.category;
    }
  });

  const preview = $derived(entry && amount !== null ? scaleNutrients(entry.per100, amount) : null);
  const canSave = $derived(amount !== null && amount > 0);

  const categoryOptions = CATEGORY_ORDER.map((value) => ({
    value,
    label: CATEGORY_SHORT_LABELS[value],
  }));

  async function save() {
    if (!entry || amount === null || amount <= 0) return;
    await updateEntry(entry.id, { amount, category });
    open = false;
  }

  async function remove() {
    if (!entry) return;
    await deleteEntries([entry.id]);
    open = false;
  }
</script>

<Sheet
  bind:open
  title={entry?.name ?? 'Eintrag'}
  confirmLabel="Sichern"
  confirmDisabled={!canSave}
  onconfirm={save}
>
  {#if entry}
    <div class="stack">
      <FormGroup>
        <NumberField
          label="Menge"
          bind:value={amount}
          unit={entry.unit}
          decimal
          autofocus
          selectOnFocus
        />
      </FormGroup>

      {#if entry.mealGroupId === undefined}
        <section>
          <p class="section-title">Mahlzeit</p>
          <SegmentedControl label="Mahlzeit" options={categoryOptions} bind:value={category} />
        </section>
      {:else}
        <p class="hint">
          Teil von „{entry.mealName ?? 'Mahlzeit'}“. Die Kategorie gilt für die ganze Mahlzeit.
        </p>
      {/if}

      {#if preview}
        <div class="preview">
          <NutrientSummary nutrients={preview} />
        </div>
      {/if}

      <button type="button" class="btn btn-danger" onclick={remove}>Eintrag löschen</button>
    </div>
  {/if}
</Sheet>

<style>
  .stack {
    display: flex;
    flex-direction: column;
  }

  section {
    margin-top: 20px;
  }

  .preview {
    margin-top: 20px;
  }

  .btn {
    width: 100%;
    margin-top: 22px;
  }
</style>
