<script lang="ts">
  import AppHeader from '../components/AppHeader.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import SearchField from '../components/SearchField.svelte';
  import SegmentedControl from '../components/SegmentedControl.svelte';
  import FoodEditorSheet from './FoodEditorSheet.svelte';
  import MealEditorSheet from './MealEditorSheet.svelte';
  import { mealNutrients } from '../calc/meals';
  import { matchesQuery } from '../calc/search';
  import { listFoods, setFoodFavorite } from '../db/foods';
  import { listMeals, setMealFavorite } from '../db/meals';
  import { liveValue } from '../db/live.svelte';
  import type { Food, Meal } from '../db/types';
  import { formatGrams, formatKcal } from '../utils/number';

  type Section = 'foods' | 'meals';

  const foods = liveValue<Food[]>(() => listFoods(), []);
  const meals = liveValue<Meal[]>(() => listMeals(), []);

  let section = $state<Section>('foods');
  let query = $state('');

  let foodEditorOpen = $state(false);
  let editingFood = $state.raw<Food | null>(null);
  let mealEditorOpen = $state(false);
  let editingMeal = $state.raw<Meal | null>(null);

  const foodsById = $derived(new Map(foods.current.map((food) => [food.id, food])));

  const visibleFoods = $derived(foods.current.filter((food) => matchesQuery(food.name, query)));
  const visibleMeals = $derived(meals.current.filter((meal) => matchesQuery(meal.name, query)));

  const sectionOptions: { value: Section; label: string }[] = [
    { value: 'foods', label: 'Lebensmittel' },
    { value: 'meals', label: 'Mahlzeiten' },
  ];

  const isEmpty = $derived(
    section === 'foods' ? foods.current.length === 0 : meals.current.length === 0,
  );
  const visible = $derived(section === 'foods' ? visibleFoods.length : visibleMeals.length);

  function openNew() {
    if (section === 'foods') {
      editingFood = null;
      foodEditorOpen = true;
    } else {
      editingMeal = null;
      mealEditorOpen = true;
    }
  }
</script>

<div class="screen">
  <AppHeader title="Bibliothek">
    {#snippet action()}
      <button
        type="button"
        class="add"
        aria-label={section === 'foods' ? 'Neues Lebensmittel' : 'Neue Mahlzeit'}
        onclick={openNew}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    {/snippet}
  </AppHeader>

  <SegmentedControl label="Bereich" options={sectionOptions} bind:value={section} />

  {#if !isEmpty}
    <div class="search">
      <SearchField
        bind:value={query}
        placeholder={section === 'foods' ? 'Lebensmittel suchen' : 'Mahlzeiten suchen'}
      />
    </div>
  {/if}

  {#if isEmpty}
    <EmptyState
      title={section === 'foods' ? 'Noch keine Lebensmittel' : 'Noch keine Mahlzeiten'}
      description={section === 'foods'
        ? 'Lege Lebensmittel an, um sie später mit einem Tipp einzutragen.'
        : 'Stelle häufige Mahlzeiten aus Lebensmitteln zusammen – etwa deine Skyr Bowl.'}
    >
      {#snippet action()}
        <button type="button" class="btn btn-secondary" onclick={openNew}>
          {section === 'foods' ? 'Lebensmittel anlegen' : 'Mahlzeit anlegen'}
        </button>
      {/snippet}
    </EmptyState>
  {:else if visible === 0}
    <EmptyState title="Nichts gefunden" description="Zu „{query}“ passt kein Eintrag." />
  {:else if section === 'foods'}
    <div class="card list">
      {#each visibleFoods as food (food.id)}
        <div class="row">
          <button
            type="button"
            class="main"
            onclick={() => {
              editingFood = food;
              foodEditorOpen = true;
            }}
          >
            <span class="name">{food.name}</span>
            <span class="details">
              {formatKcal(food.per100.kcal)} kcal · {formatGrams(food.per100.protein)} g Protein
              pro 100 {food.unit}
            </span>
          </button>
          <button
            type="button"
            class="star"
            class:on={food.favorite}
            aria-label={food.favorite
              ? `${food.name} aus Favoriten entfernen`
              : `${food.name} zu Favoriten hinzufügen`}
            aria-pressed={food.favorite}
            onclick={() => setFoodFavorite(food.id, !food.favorite)}
          >
            <svg
              viewBox="0 0 24 24"
              fill={food.favorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.9l-5.2 2.7 1-5.75-4.2-4.1 5.8-.85z" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {:else}
    <div class="card list">
      {#each visibleMeals as meal (meal.id)}
        {@const totals = mealNutrients(meal.ingredients, foodsById)}
        <div class="row">
          <button
            type="button"
            class="main"
            onclick={() => {
              editingMeal = meal;
              mealEditorOpen = true;
            }}
          >
            <span class="name">{meal.name}</span>
            <span class="details">
              {formatKcal(totals.kcal)} kcal · {meal.ingredients.length}
              {meal.ingredients.length === 1 ? 'Zutat' : 'Zutaten'}
            </span>
          </button>
          <button
            type="button"
            class="star"
            class:on={meal.favorite}
            aria-label={meal.favorite
              ? `${meal.name} aus Favoriten entfernen`
              : `${meal.name} zu Favoriten hinzufügen`}
            aria-pressed={meal.favorite}
            onclick={() => setMealFavorite(meal.id, !meal.favorite)}
          >
            <svg
              viewBox="0 0 24 24"
              fill={meal.favorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.9l-5.2 2.7 1-5.75-4.2-4.1 5.8-.85z" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<FoodEditorSheet bind:open={foodEditorOpen} food={editingFood} />
<MealEditorSheet bind:open={mealEditorOpen} meal={editingMeal} foods={foods.current} />

<style>
  .add {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--tap);
    height: var(--tap);
    margin: -10px -10px 0 0;
    color: var(--accent);
  }

  .add svg {
    width: 26px;
    height: 26px;
  }

  .add:active {
    opacity: 0.5;
  }

  .search {
    margin-top: 14px;
  }

  .list {
    margin-top: 16px;
    padding: 0;
  }

  .row {
    display: flex;
    align-items: center;
  }

  .row + .row {
    box-shadow: inset 0 0.5px 0 var(--separator);
  }

  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    min-height: var(--tap);
    padding: 9px 4px 9px 16px;
    text-align: left;
  }

  .main:active {
    opacity: 0.5;
  }

  .name {
    font-size: 17px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .details {
    font-size: 13px;
    color: var(--text-2);
  }

  .star {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--tap);
    height: var(--tap);
    color: var(--text-3);
  }

  .star.on {
    color: var(--fat);
  }

  .star svg {
    width: 21px;
    height: 21px;
  }

  .star:active {
    opacity: 0.5;
  }
</style>
