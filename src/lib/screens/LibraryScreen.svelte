<script lang="ts">
  import AppHeader from '../components/AppHeader.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import SearchField from '../components/SearchField.svelte';
  import FoodEditorSheet from './FoodEditorSheet.svelte';
  import { matchesQuery } from '../calc/search';
  import { listFoods, setFoodFavorite } from '../db/foods';
  import { liveValue } from '../db/live.svelte';
  import type { Food } from '../db/types';
  import { formatGrams, formatKcal } from '../utils/number';

  const foods = liveValue<Food[]>(() => listFoods(), []);

  let query = $state('');
  let editorOpen = $state(false);
  let editing = $state.raw<Food | null>(null);

  const filtered = $derived(foods.current.filter((food) => matchesQuery(food.name, query)));

  function openNew() {
    editing = null;
    editorOpen = true;
  }

  function openEdit(food: Food) {
    editing = food;
    editorOpen = true;
  }
</script>

<div class="screen">
  <AppHeader title="Bibliothek">
    {#snippet action()}
      <button type="button" class="add" aria-label="Neues Lebensmittel" onclick={openNew}>
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

  {#if foods.current.length > 0}
    <SearchField bind:value={query} placeholder="Lebensmittel suchen" />
  {/if}

  {#if foods.current.length === 0}
    <EmptyState
      title="Noch keine Lebensmittel"
      description="Lege Lebensmittel an, um sie später mit einem Tipp einzutragen."
    >
      {#snippet action()}
        <button type="button" class="btn btn-secondary" onclick={openNew}>
          Lebensmittel anlegen
        </button>
      {/snippet}
    </EmptyState>
  {:else if filtered.length === 0}
    <EmptyState title="Nichts gefunden" description="Zu „{query}“ passt kein Lebensmittel." />
  {:else}
    <div class="card list">
      {#each filtered as food (food.id)}
        <div class="row">
          <button type="button" class="main" onclick={() => openEdit(food)}>
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
              <path
                d="M12 3.6l2.6 5.3 5.8.85-4.2 4.1 1 5.75L12 16.9l-5.2 2.7 1-5.75-4.2-4.1 5.8-.85z"
              />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<FoodEditorSheet bind:open={editorOpen} food={editing} />

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
