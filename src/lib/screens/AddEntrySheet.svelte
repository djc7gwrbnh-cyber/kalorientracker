<script lang="ts">
  import EmptyState from '../components/EmptyState.svelte';
  import FormGroup from '../components/FormGroup.svelte';
  import NumberField from '../components/NumberField.svelte';
  import NutrientSummary from '../components/NutrientSummary.svelte';
  import PickerList from '../components/PickerList.svelte';
  import SearchField from '../components/SearchField.svelte';
  import SegmentedControl from '../components/SegmentedControl.svelte';
  import Sheet from '../components/Sheet.svelte';
  import { mealNutrients } from '../calc/meals';
  import { scaleNutrients } from '../calc/nutrition';
  import { buildPickerSections, sortByRelevance } from '../calc/picker';
  import { matchesQuery } from '../calc/search';
  import { listFoods } from '../db/foods';
  import { liveValue } from '../db/live.svelte';
  import { listMeals } from '../db/meals';
  import type { Food, Meal, MealCategory } from '../db/types';
  import { addFoodEntry, addMealEntries, undoEntries } from '../entryActions';
  import { toastStore } from '../stores/toast.svelte';
  import { CATEGORY_ORDER, CATEGORY_SHORT_LABELS, suggestCategory, todayKey } from '../utils/date';
  import { formatGrams, formatKcal } from '../utils/number';

  let {
    open = $bindable(),
    day = todayKey(),
  }: {
    open: boolean;
    day?: string;
  } = $props();

  const foods = liveValue<Food[]>(() => listFoods(), []);
  const meals = liveValue<Meal[]>(() => listMeals(), []);

  let query = $state('');
  let selectedFood = $state.raw<Food | null>(null);
  let selectedMeal = $state.raw<Meal | null>(null);
  let amount = $state<number | null>(null);
  let factor = $state<number | null>(1);
  let category = $state<MealCategory>(suggestCategory());

  // Jedes Oeffnen startet frisch, mit der zur Uhrzeit passenden Kategorie.
  $effect(() => {
    if (open) {
      query = '';
      selectedFood = null;
      selectedMeal = null;
      category = suggestCategory();
    }
  });

  const foodsById = $derived(new Map(foods.current.map((food) => [food.id, food])));
  const trimmedQuery = $derived(query.trim());

  const mealSections = $derived(
    (() => {
      const matching = trimmedQuery
        ? meals.current.filter((meal) => matchesQuery(meal.name, query))
        : meals.current;
      const items = sortByRelevance(matching);
      return items.length > 0 ? [{ title: 'Mahlzeiten', items }] : [];
    })(),
  );

  const foodSections = $derived(
    trimmedQuery
      ? (() => {
          const items = foods.current.filter((food) => matchesQuery(food.name, query));
          return items.length > 0 ? [{ title: 'Lebensmittel', items }] : [];
        })()
      : buildPickerSections(foods.current),
  );

  const nothingToShow = $derived(mealSections.length === 0 && foodSections.length === 0);

  const foodPreview = $derived(
    selectedFood && amount !== null ? scaleNutrients(selectedFood.per100, amount) : null,
  );
  const mealPreview = $derived(
    selectedMeal && factor !== null
      ? mealNutrients(selectedMeal.ingredients, foodsById, factor)
      : null,
  );

  const canAddFood = $derived(selectedFood !== null && amount !== null && amount > 0);
  const canAddMeal = $derived(selectedMeal !== null && factor !== null && factor > 0);

  const categoryOptions = CATEGORY_ORDER.map((value) => ({
    value,
    label: CATEGORY_SHORT_LABELS[value],
  }));

  function chooseFood(food: Food) {
    selectedFood = food;
    amount = food.servingSize ?? 100;
  }

  function chooseMeal(meal: Meal) {
    selectedMeal = meal;
    factor = 1;
  }

  function showUndo(name: string, ids: string[]) {
    if (ids.length === 0) return;
    toastStore.show(`${name} eingetragen`, {
      label: 'Rückgängig',
      run: () => undoEntries(ids),
    });
  }

  async function add() {
    if (selectedMeal && factor !== null && factor > 0) {
      const meal = selectedMeal;
      const ids = await addMealEntries(meal, foodsById, { day, category }, factor);
      open = false;
      showUndo(meal.name, ids);
      return;
    }

    if (selectedFood && amount !== null && amount > 0) {
      const food = selectedFood;
      const ids = await addFoodEntry(food, amount, { day, category });
      open = false;
      showUndo(food.name, ids);
    }
  }

  const selectedName = $derived(selectedMeal?.name ?? selectedFood?.name ?? 'Hinzufügen');
  const isPicking = $derived(selectedFood === null && selectedMeal === null);
</script>

<Sheet
  bind:open
  title={isPicking ? 'Hinzufügen' : selectedName}
  cancelLabel={isPicking ? 'Abbrechen' : 'Zurück'}
  oncancel={isPicking
    ? undefined
    : () => {
        selectedFood = null;
        selectedMeal = null;
      }}
  confirmLabel={isPicking ? undefined : 'Hinzufügen'}
  confirmDisabled={!(canAddFood || canAddMeal)}
  onconfirm={add}
>
  {#if isPicking}
    {#if foods.current.length === 0 && meals.current.length === 0}
      <EmptyState
        title="Noch keine Lebensmittel"
        description="Lege in der Bibliothek ein Lebensmittel an, dann kannst du es hier mit einem Tipp eintragen."
      />
    {:else}
      <SearchField bind:value={query} placeholder="Suchen" />

      {#if nothingToShow}
        <EmptyState title="Nichts gefunden" description="Zu „{query}“ passt kein Eintrag." />
      {:else}
        <PickerList
          sections={mealSections}
          secondary={(meal) =>
            `${formatKcal(mealNutrients(meal.ingredients, foodsById).kcal)} kcal`}
          onpick={chooseMeal}
        />
        <PickerList
          sections={foodSections}
          secondary={(food) => `${formatKcal(food.per100.kcal)} kcal / 100 ${food.unit}`}
          onpick={chooseFood}
        />
      {/if}
    {/if}
  {:else}
    <div class="stack">
      {#if selectedMeal}
        {@const meal = selectedMeal}
        <FormGroup footer="1 bedeutet eine ganze Mahlzeit, 0,5 eine halbe.">
          <NumberField label="Portionen" bind:value={factor} unit="×" decimal selectOnFocus />
        </FormGroup>

        <section>
          <p class="section-title">Zutaten</p>
          <div class="card list">
            {#each meal.ingredients as ingredient (ingredient.foodId)}
              {@const food = foodsById.get(ingredient.foodId)}
              <div class="ingredient">
                <span class="name">{food?.name ?? 'Gelöschtes Lebensmittel'}</span>
                <span class="value">
                  {formatGrams(ingredient.amount * (factor ?? 1))}
                  {food?.unit ?? ''}
                </span>
              </div>
            {/each}
          </div>
        </section>
      {:else if selectedFood}
        {@const food = selectedFood}
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

        {#if food.servingSize !== undefined}
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
      {/if}

      <section>
        <p class="section-title">Mahlzeit</p>
        <SegmentedControl label="Mahlzeit" options={categoryOptions} bind:value={category} />
      </section>

      {#if foodPreview || mealPreview}
        {@const preview = mealPreview ?? foodPreview!}
        <div class="preview">
          <NutrientSummary nutrients={preview} />
        </div>
      {/if}
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

  .list {
    padding: 0;
  }

  .ingredient {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 16px;
    font-size: 15px;
  }

  .ingredient + .ingredient {
    box-shadow: inset 0 0.5px 0 var(--separator);
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .value {
    flex: none;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
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
    margin-top: 20px;
  }
</style>
