<script lang="ts">
  import { entryNutrients, sumEntries } from '../calc/nutrition';
  import type { FoodEntry } from '../db/types';
  import { CATEGORY_LABELS, CATEGORY_ORDER } from '../utils/date';
  import { formatGrams, formatKcal } from '../utils/number';

  let { entries }: { entries: FoodEntry[] } = $props();

  const groups = $derived(
    CATEGORY_ORDER.map((category) => ({
      category,
      entries: entries.filter((entry) => entry.category === category),
    })).filter((group) => group.entries.length > 0),
  );
</script>

{#each groups as group (group.category)}
  <section>
    <div class="head">
      <p class="section-title">{CATEGORY_LABELS[group.category]}</p>
      <span class="sum">{formatKcal(sumEntries(group.entries).kcal)} kcal</span>
    </div>

    <div class="card list">
      {#each group.entries as entry (entry.id)}
        {@const nutrients = entryNutrients(entry)}
        <div class="row">
          <div class="main">
            <span class="name">{entry.name}</span>
            <span class="kcal">{formatKcal(nutrients.kcal)} kcal</span>
          </div>
          <div class="details">
            <span>{formatGrams(entry.amount)} {entry.unit}</span>
            <span class="macros">
              P {formatGrams(nutrients.protein)} g · F {formatGrams(nutrients.fat)} g · KH
              {formatGrams(nutrients.carbs)} g
            </span>
          </div>
        </div>
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
