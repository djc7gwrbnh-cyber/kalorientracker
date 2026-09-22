<script lang="ts">
  import EmptyState from '../components/EmptyState.svelte';
  import FormGroup from '../components/FormGroup.svelte';
  import NumberField from '../components/NumberField.svelte';
  import SearchField from '../components/SearchField.svelte';
  import SegmentedControl from '../components/SegmentedControl.svelte';
  import Sheet from '../components/Sheet.svelte';
  import { scaleNutrients } from '../calc/nutrition';
  import { buildPickerSections } from '../calc/picker';
  import { matchesQuery } from '../calc/search';
  import { addEntries } from '../db/entries';
  import { listFoods, markFoodUsed } from '../db/foods';
  import { liveValue } from '../db/live.svelte';
  import type { Food, MealCategory } from '../db/types';
  import {
    CATEGORY_ORDER,
    CATEGORY_SHORT_LABELS,
    suggestCategory,
    todayKey,
  } from '../utils/date';
  import { formatGrams, formatKcal } from '../utils/number';

  let {
    open = $bindable(),
    day = todayKey(),
  }: {
    open: boolean;
    day?: string;
  } = $props();

  const foods = liveValue<Food[]>(() => listFoods(), []);

  let query = $state('');
  // raw: Datensaetze aus der Datenbank bleiben einfache Objekte und lassen
  // sich dadurch wieder speichern.
  let selected = $state.raw<Food | null>(null);
  let amount = $state<number | null>(null);
  let category = $state<MealCategory>(suggestCategory());

  // Jedes Oeffnen startet frisch, mit der zur Uhrzeit passenden Kategorie.
  $effect(() => {
    if (open) {
      query = '';
      selected = null;
      category = suggestCategory();
    }
  });

  const sections = $derived(
    query.trim()
      ? [{ title: 'Treffer', items: foods.current.filter((f) => matchesQuery(f.name, query)) }]
      : buildPickerSections(foods.current),
  );

  const preview = $derived(
    selected && amount !== null ? scaleNutrients(selected.per100, amount) : null,
  );
  const canAdd = $derived(selected !== null && amount !== null && amount > 0);

  const categoryOptions = CATEGORY_ORDER.map((value) => ({
    value,
    label: CATEGORY_SHORT_LABELS[value],
  }));

  function choose(food: Food) {
    selected = food;
    amount = food.servingSize ?? 100;
  }

  async function add() {
    const food = selected;
    if (!food || amount === null || amount <= 0) return;

    await addEntries([
      {
        timestamp: Date.now(),
        day,
        category,
        amount,
        name: food.name,
        per100: food.per100,
        unit: food.unit,
        foodId: food.id,
      },
    ]);
    await markFoodUsed(food.id);
    open = false;
  }
</script>

<Sheet
  bind:open
  title={selected ? selected.name : 'Hinzufügen'}
  cancelLabel={selected ? 'Zurück' : 'Abbrechen'}
  oncancel={selected ? () => (selected = null) : undefined}
  confirmLabel={selected ? 'Hinzufügen' : undefined}
  confirmDisabled={!canAdd}
  onconfirm={add}
>
  {#if !selected}
    {#if foods.current.length === 0}
      <EmptyState
        title="Noch keine Lebensmittel"
        description="Lege in der Bibliothek ein Lebensmittel an, dann kannst du es hier mit einem Tipp eintragen."
      />
    {:else}
      <SearchField bind:value={query} placeholder="Lebensmittel suchen" />

      {#if sections.length === 0}
        <EmptyState title="Nichts gefunden" description="Zu „{query}“ passt kein Lebensmittel." />
      {:else}
        {#each sections as section (section.title)}
          <section>
            <p class="section-title">{section.title}</p>
            <div class="card list">
              {#each section.items as food (food.id)}
                <button type="button" class="pick" onclick={() => choose(food)}>
                  <span class="name">{food.name}</span>
                  <span class="per100">{formatKcal(food.per100.kcal)} kcal / 100 {food.unit}</span>
                </button>
              {/each}
            </div>
          </section>
        {/each}
      {/if}
    {/if}
  {:else}
    {@const food = selected}
    <div class="stack">
      <FormGroup>
        <NumberField
          label="Menge"
          bind:value={amount}
          unit={food.unit}
          decimal
          autofocus
          selectOnFocus
        />
      </FormGroup>

      {#if food.servingSize !== undefined && food.servingName !== undefined}
        {@const servingSize = food.servingSize}
        <div class="chips">
          <button type="button" class="chip" onclick={() => (amount = servingSize)}>
            {food.servingName} · {formatGrams(servingSize)}
            {food.unit}
          </button>
          <button type="button" class="chip" onclick={() => (amount = 100)}>
            100 {food.unit}
          </button>
        </div>
      {/if}

      <section>
        <p class="section-title">Mahlzeit</p>
        <SegmentedControl label="Mahlzeit" options={categoryOptions} bind:value={category} />
      </section>

      {#if preview}
        <div class="card preview">
          <strong>{formatKcal(preview.kcal)} kcal</strong>
          <div class="macros">
            <span>P {formatGrams(preview.protein)} g</span>
            <span>F {formatGrams(preview.fat)} g</span>
            <span>KH {formatGrams(preview.carbs)} g</span>
          </div>
        </div>
      {/if}
    </div>
  {/if}
</Sheet>

<style>
  section {
    margin-top: 20px;
  }

  .list {
    padding: 0;
  }

  .pick {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: var(--tap);
    padding: 10px 16px;
    text-align: left;
  }

  .pick + .pick {
    box-shadow: inset 0 0.5px 0 var(--separator);
  }

  .pick:active {
    background: var(--fill);
  }

  .name {
    font-size: 17px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .per100 {
    flex: none;
    font-size: 13px;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .chip {
    min-height: 36px;
    padding: 0 14px;
    border-radius: var(--radius-pill);
    background: var(--fill);
    font-size: 15px;
  }

  .chip:active {
    opacity: 0.6;
  }

  .preview {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-top: 20px;
  }

  .preview strong {
    font-size: 22px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  .macros {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
  }
</style>
