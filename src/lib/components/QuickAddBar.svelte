<script lang="ts">
  import { sortByRelevance } from '../calc/picker';
  import type { Food, Meal } from '../db/types';
  import { addFoodEntry, addMealEntries, undoEntries } from '../entryActions';
  import { toastStore } from '../stores/toast.svelte';
  import { suggestCategory } from '../utils/date';

  let {
    day,
    foods,
    meals,
  }: {
    day: string;
    foods: Food[];
    meals: Meal[];
  } = $props();

  const foodsById = $derived(new Map(foods.map((food) => [food.id, food])));
  const favoriteMeals = $derived(sortByRelevance(meals.filter((meal) => meal.favorite)));
  const favoriteFoods = $derived(sortByRelevance(foods.filter((food) => food.favorite)));

  // Verhindert doppelte Eintraege bei schnellem Doppeltippen.
  let busy = $state(false);

  function showUndo(name: string, ids: string[]) {
    if (ids.length === 0) return;
    toastStore.show(`${name} eingetragen`, { label: 'Rückgängig', run: () => undoEntries(ids) });
  }

  async function quickAddMeal(meal: Meal) {
    if (busy) return;
    busy = true;
    try {
      const ids = await addMealEntries(meal, foodsById, {
        day,
        category: suggestCategory(),
      });
      showUndo(meal.name, ids);
    } finally {
      busy = false;
    }
  }

  async function quickAddFood(food: Food) {
    if (busy) return;
    busy = true;
    try {
      const ids = await addFoodEntry(food, food.servingSize ?? 100, {
        day,
        category: suggestCategory(),
      });
      showUndo(food.name, ids);
    } finally {
      busy = false;
    }
  }
</script>

{#if favoriteMeals.length > 0 || favoriteFoods.length > 0}
  <div class="quick" role="group" aria-label="Schnellzugriff">
    {#each favoriteMeals as meal (meal.id)}
      <button type="button" class="chip meal" disabled={busy} onclick={() => quickAddMeal(meal)}>
        + {meal.name}
      </button>
    {/each}
    {#each favoriteFoods as food (food.id)}
      <button type="button" class="chip" disabled={busy} onclick={() => quickAddFood(food)}>
        + {food.name}
      </button>
    {/each}
  </div>
{/if}

<style>
  .quick {
    display: flex;
    gap: 8px;
    /* Bis an den Bildschirmrand scrollen, Inhalt bleibt eingerueckt. */
    margin: 20px -16px 0;
    padding: 0 16px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .quick::-webkit-scrollbar {
    display: none;
  }

  .chip {
    flex: none;
    min-height: 38px;
    padding: 0 16px;
    border-radius: var(--radius-pill);
    background: var(--fill);
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    transition:
      transform 0.1s ease,
      opacity 0.15s ease;
  }

  .chip.meal {
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    color: var(--accent);
  }

  .chip:active:not(:disabled) {
    transform: scale(0.96);
    opacity: 0.7;
  }

  .chip:disabled {
    opacity: 0.5;
  }
</style>
