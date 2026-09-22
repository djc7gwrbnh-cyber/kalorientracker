<script lang="ts">
  import FormGroup from '../components/FormGroup.svelte';
  import NumberField from '../components/NumberField.svelte';
  import PickerList from '../components/PickerList.svelte';
  import SearchField from '../components/SearchField.svelte';
  import Sheet from '../components/Sheet.svelte';
  import TextField from '../components/TextField.svelte';
  import ToggleField from '../components/ToggleField.svelte';
  import { mealNutrients } from '../calc/meals';
  import { buildPickerSections } from '../calc/picker';
  import { matchesQuery } from '../calc/search';
  import {
    createMeal,
    deleteMeal,
    emptyMealDraft,
    toMealDraft,
    toMealValues,
    updateMeal,
    type MealDraft,
  } from '../db/meals';
  import type { Food, Meal } from '../db/types';
  import { formatGrams, formatKcal } from '../utils/number';

  let {
    open = $bindable(),
    meal = null,
    foods,
  }: {
    open: boolean;
    /** null legt eine neue Mahlzeit an. */
    meal?: Meal | null;
    foods: Food[];
  } = $props();

  type Step = 'form' | 'pick' | 'amount';

  let draft = $state<MealDraft>(emptyMealDraft());
  let step = $state<Step>('form');
  let query = $state('');
  /** Index der Zutat, deren Menge gerade bearbeitet wird; -1 heisst neu. */
  let editingIndex = $state(-1);
  let editingFood = $state.raw<Food | null>(null);
  let editingAmount = $state<number | null>(null);

  $effect(() => {
    if (open) {
      draft = meal ? toMealDraft(meal) : emptyMealDraft();
      step = 'form';
      query = '';
    }
  });

  const foodsById = $derived(new Map(foods.map((food) => [food.id, food])));
  const values = $derived(toMealValues(draft));

  const totals = $derived(
    mealNutrients(
      draft.ingredients
        .filter((ingredient) => ingredient.amount !== null)
        .map((ingredient) => ({ foodId: ingredient.foodId, amount: ingredient.amount ?? 0 })),
      foodsById,
    ),
  );

  const pickerSections = $derived(
    query.trim()
      ? [{ title: 'Treffer', items: foods.filter((food) => matchesQuery(food.name, query)) }]
      : buildPickerSections(foods),
  );

  function startAdd() {
    editingIndex = -1;
    editingFood = null;
    editingAmount = null;
    query = '';
    step = 'pick';
  }

  function pickFood(food: Food) {
    editingFood = food;
    editingAmount = food.servingSize ?? 100;
    step = 'amount';
  }

  function startEdit(index: number) {
    const ingredient = draft.ingredients[index];
    if (!ingredient) return;
    editingIndex = index;
    editingFood = foodsById.get(ingredient.foodId) ?? null;
    editingAmount = ingredient.amount;
    step = 'amount';
  }

  function confirmAmount() {
    if (editingAmount === null || editingAmount <= 0) return;

    if (editingIndex >= 0) {
      const ingredient = draft.ingredients[editingIndex];
      if (ingredient) ingredient.amount = editingAmount;
    } else if (editingFood) {
      draft.ingredients.push({ foodId: editingFood.id, amount: editingAmount });
    }
    step = 'form';
  }

  function removeIngredient(index: number) {
    draft.ingredients.splice(index, 1);
  }

  async function save() {
    if (!values) return;
    if (meal) await updateMeal(meal.id, values);
    else await createMeal(values);
    open = false;
  }

  async function remove() {
    if (!meal) return;
    const sure = confirm(
      `„${meal.name}“ löschen? Bereits eingetragene Tage bleiben unverändert.`,
    );
    if (!sure) return;
    await deleteMeal(meal.id);
    open = false;
  }

  const title = $derived(
    step === 'pick'
      ? 'Zutat wählen'
      : step === 'amount'
        ? (editingFood?.name ?? 'Menge')
        : meal
          ? 'Mahlzeit'
          : 'Neue Mahlzeit',
  );
</script>

<Sheet
  bind:open
  {title}
  cancelLabel={step === 'form' ? 'Abbrechen' : 'Zurück'}
  oncancel={step === 'form' ? undefined : () => (step = 'form')}
  confirmLabel={step === 'form' ? 'Sichern' : step === 'amount' ? 'Übernehmen' : undefined}
  confirmDisabled={step === 'form'
    ? !values
    : editingAmount === null || editingAmount <= 0}
  onconfirm={step === 'form' ? save : confirmAmount}
>
  {#if step === 'pick'}
    {#if foods.length === 0}
      <p class="hint">Lege zuerst Lebensmittel an, dann kannst du sie hier zusammenstellen.</p>
    {:else}
      <SearchField bind:value={query} placeholder="Lebensmittel suchen" />
      <PickerList
        sections={pickerSections}
        secondary={(food) => `${formatKcal(food.per100.kcal)} kcal / 100 ${food.unit}`}
        onpick={pickFood}
      />
    {/if}
  {:else if step === 'amount'}
    <FormGroup>
      <NumberField
        label="Menge"
        bind:value={editingAmount}
        unit={editingFood?.unit ?? 'g'}
        decimal
        autofocus
        selectOnFocus
      />
    </FormGroup>
  {:else}
    <div class="stack">
      <FormGroup>
        <TextField label="Name" bind:value={draft.name} placeholder="z. B. Skyr Bowl" />
        <ToggleField label="Favorit" bind:checked={draft.favorite} />
      </FormGroup>

      <section>
        <p class="section-title">Zutaten</p>
        <div class="card list">
          {#each draft.ingredients as ingredient, index (index)}
            {@const food = foodsById.get(ingredient.foodId)}
            <div class="row">
              <button type="button" class="main" onclick={() => startEdit(index)}>
                <span class="name" class:missing={!food}>
                  {food?.name ?? 'Gelöschtes Lebensmittel'}
                </span>
                <span class="amount">
                  {ingredient.amount === null ? '–' : formatGrams(ingredient.amount)}
                  {food?.unit ?? ''}
                </span>
              </button>
              <button
                type="button"
                class="remove"
                aria-label="{food?.name ?? 'Zutat'} entfernen"
                onclick={() => removeIngredient(index)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M7 12h10" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          {/each}

          <button type="button" class="add-row" onclick={startAdd}>+ Zutat hinzufügen</button>
        </div>
      </section>

      {#if draft.ingredients.length > 0}
        <div class="card totals">
          <strong>{formatKcal(totals.kcal)} kcal</strong>
          <div class="macros">
            <span>P {formatGrams(totals.protein)} g</span>
            <span>F {formatGrams(totals.fat)} g</span>
            <span>KH {formatGrams(totals.carbs)} g</span>
          </div>
        </div>
      {/if}

      {#if meal}
        <button type="button" class="btn btn-danger delete" onclick={remove}>Löschen</button>
      {/if}
    </div>
  {/if}
</Sheet>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }

  section {
    margin: 0;
  }

  .list {
    padding: 0;
  }

  .row {
    display: flex;
    align-items: center;
  }

  .row + .row,
  .row + .add-row {
    box-shadow: inset 0 0.5px 0 var(--separator);
  }

  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    min-height: var(--tap);
    padding: 10px 4px 10px 16px;
    text-align: left;
  }

  .main:active {
    opacity: 0.5;
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .name.missing {
    color: var(--danger);
  }

  .amount {
    flex: none;
    font-size: 15px;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
  }

  .remove {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--tap);
    height: var(--tap);
    color: var(--danger);
  }

  .remove svg {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--danger);
    color: var(--surface);
    padding: 3px;
  }

  .remove:active {
    opacity: 0.5;
  }

  .add-row {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: var(--tap);
    padding: 10px 16px;
    color: var(--accent);
    text-align: left;
  }

  .add-row:active {
    background: var(--fill);
  }

  .totals {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .totals strong {
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

  .delete {
    width: 100%;
  }
</style>
