<script lang="ts">
  import { groupEntries } from '../calc/entryGroups';
  import { entryNutrients, sumEntries } from '../calc/nutrition';
  import type { FoodEntry } from '../db/types';
  import { CATEGORY_LABELS, CATEGORY_ORDER } from '../utils/date';
  import { formatGrams, formatKcal } from '../utils/number';

  let { entries }: { entries: FoodEntry[] } = $props();

  const groups = $derived(
    CATEGORY_ORDER.map((category) => ({
      category,
      entries: entries.filter((entry) => entry.category === category),
    }))
      .filter((group) => group.entries.length > 0)
      .map((group) => ({ ...group, rows: groupEntries(group.entries) })),
  );

  let expanded = $state<string[]>([]);

  function toggle(key: string) {
    expanded = expanded.includes(key)
      ? expanded.filter((entry) => entry !== key)
      : [...expanded, key];
  }
</script>

{#snippet macros(entry: { protein: number; fat: number; carbs: number })}
  <span class="macros">
    P {formatGrams(entry.protein)} g · F {formatGrams(entry.fat)} g · KH
    {formatGrams(entry.carbs)} g
  </span>
{/snippet}

{#each groups as group (group.category)}
  <section>
    <div class="head">
      <p class="section-title">{CATEGORY_LABELS[group.category]}</p>
      <span class="sum">{formatKcal(sumEntries(group.entries).kcal)} kcal</span>
    </div>

    <div class="card list">
      {#each group.rows as row (row.key)}
        {#if row.kind === 'single'}
          {@const nutrients = entryNutrients(row.entry)}
          <div class="row">
            <div class="main">
              <span class="name">{row.entry.name}</span>
              <span class="kcal">{formatKcal(nutrients.kcal)} kcal</span>
            </div>
            <div class="details">
              <span>{formatGrams(row.entry.amount)} {row.entry.unit}</span>
              {@render macros(nutrients)}
            </div>
          </div>
        {:else}
          {@const totals = sumEntries(row.entries)}
          {@const isOpen = expanded.includes(row.key)}
          <div class="row">
            <button
              type="button"
              class="meal-head"
              aria-expanded={isOpen}
              onclick={() => toggle(row.key)}
            >
              <div class="main">
                <span class="name">
                  <svg
                    class="chevron"
                    class:open={isOpen}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                  {row.name}
                </span>
                <span class="kcal">{formatKcal(totals.kcal)} kcal</span>
              </div>
              <div class="details">
                <span>
                  {row.entries.length}
                  {row.entries.length === 1 ? 'Zutat' : 'Zutaten'}
                </span>
                {@render macros(totals)}
              </div>
            </button>
          </div>

          {#if isOpen}
            {#each row.entries as entry (entry.id)}
              {@const nutrients = entryNutrients(entry)}
              <div class="row sub">
                <div class="main">
                  <span class="name">{entry.name}</span>
                  <span class="kcal">{formatKcal(nutrients.kcal)} kcal</span>
                </div>
                <div class="details">
                  <span>{formatGrams(entry.amount)} {entry.unit}</span>
                </div>
              </div>
            {/each}
          {/if}
        {/if}
      {/each}
    </div>
  </section>
{/each}

<style>
  section + section {
    margin-top: 18px;
  }

  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .sum {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
    padding-bottom: 8px;
  }

  .list {
    padding: 0;
  }

  .row {
    padding: 11px 16px;
  }

  .row + .row {
    box-shadow: inset 0 0.5px 0 var(--separator);
  }

  .row.sub {
    padding-left: 34px;
    background: var(--surface-2);
  }

  .meal-head {
    display: block;
    width: 100%;
    padding: 0;
    text-align: left;
  }

  .meal-head:active {
    opacity: 0.55;
  }

  .main {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .name {
    font-size: 17px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chevron {
    width: 13px;
    height: 13px;
    margin-right: 2px;
    color: var(--text-3);
    transition: transform 0.18s ease;
  }

  .chevron.open {
    transform: rotate(90deg);
  }

  .kcal {
    flex: none;
    font-size: 15px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .details {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-top: 2px;
    font-size: 13px;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
  }

  .macros {
    flex: none;
  }
</style>
