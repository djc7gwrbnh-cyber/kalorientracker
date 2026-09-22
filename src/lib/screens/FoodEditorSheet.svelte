<script lang="ts">
  import FormGroup from '../components/FormGroup.svelte';
  import NumberField from '../components/NumberField.svelte';
  import SegmentedControl from '../components/SegmentedControl.svelte';
  import Sheet from '../components/Sheet.svelte';
  import TextField from '../components/TextField.svelte';
  import ToggleField from '../components/ToggleField.svelte';
  import {
    createFood,
    deleteFood,
    emptyFoodDraft,
    toFoodDraft,
    toFoodValues,
    updateFood,
    type FoodDraft,
  } from '../db/foods';
  import type { Food, Unit } from '../db/types';

  let {
    open = $bindable(),
    food = null,
    initialDraft = null,
    onsaved,
  }: {
    open: boolean;
    /** null legt ein neues Lebensmittel an. */
    food?: Food | null;
    /** Vorbelegung fuer ein neues Lebensmittel, z. B. aus Open Food Facts. */
    initialDraft?: FoodDraft | null;
    onsaved?: (food: Food) => void;
  } = $props();

  let draft = $state<FoodDraft>(emptyFoodDraft());

  $effect(() => {
    if (open) draft = food ? toFoodDraft(food) : (initialDraft ?? emptyFoodDraft());
  });

  const values = $derived(toFoodValues(draft));
  const unitOptions: { value: Unit; label: string }[] = [
    { value: 'g', label: 'Gramm (g)' },
    { value: 'ml', label: 'Milliliter (ml)' },
  ];

  async function save() {
    if (!values) return;

    if (food) {
      await updateFood(food.id, values);
      onsaved?.({ ...food, ...values, updatedAt: Date.now() });
    } else {
      const created = await createFood(values);
      onsaved?.(created);
    }
    open = false;
  }

  async function remove() {
    if (!food) return;
    const sure = confirm(
      `„${food.name}“ löschen? Bereits eingetragene Mahlzeiten bleiben unverändert.`,
    );
    if (!sure) return;

    await deleteFood(food.id);
    open = false;
  }
</script>

<Sheet
  bind:open
  title={food ? 'Lebensmittel' : 'Neues Lebensmittel'}
  confirmLabel="Sichern"
  confirmDisabled={!values}
  onconfirm={save}
>
  <div class="stack">
    <FormGroup>
      <TextField label="Name" bind:value={draft.name} placeholder="z. B. Skyr" />
      <div class="unit-row">
        <span>Einheit</span>
        <div class="unit-control">
          <SegmentedControl label="Einheit" options={unitOptions} bind:value={draft.unit} />
        </div>
      </div>
    </FormGroup>

    <FormGroup title="Nährwerte pro 100 {draft.unit}">
      <NumberField label="Kalorien" bind:value={draft.kcal} unit="kcal" decimal />
      <NumberField label="Protein" bind:value={draft.protein} unit="g" decimal />
      <NumberField label="Fett" bind:value={draft.fat} unit="g" decimal />
      <NumberField label="Kohlenhydrate" bind:value={draft.carbs} unit="g" decimal />
    </FormGroup>

    <FormGroup
      title="Portion (optional)"
      footer="Eine Portion spart Tippen: „1 Banane“ mit 120 g trägt mit einem Tipp 120 g ein."
    >
      <TextField label="Bezeichnung" bind:value={draft.servingName} placeholder="1 Banane" />
      <NumberField
        label="Entspricht"
        bind:value={draft.servingSize}
        unit={draft.unit}
        decimal
      />
    </FormGroup>

    <FormGroup>
      <ToggleField label="Favorit" bind:checked={draft.favorite} />
    </FormGroup>

    {#if food}
      <button type="button" class="btn btn-danger delete" onclick={remove}>Löschen</button>
    {/if}
  </div>
</Sheet>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  .unit-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: var(--tap);
    padding: 6px 16px;
  }

  .unit-control {
    flex: 0 1 220px;
  }

  .delete {
    width: 100%;
  }
</style>
