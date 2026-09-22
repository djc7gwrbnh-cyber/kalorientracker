<script lang="ts">
  import type { Nutrients } from '../db/types';
  import { formatGrams, formatKcal } from '../utils/number';

  let { nutrients, goalKcal }: { nutrients: Nutrients; goalKcal?: number } = $props();
</script>

<div class="card summary">
  <strong>
    {formatKcal(nutrients.kcal)}{#if goalKcal !== undefined}<span class="goal">
        / {formatKcal(goalKcal)}</span
      >{/if} kcal
  </strong>
  <div class="macros">
    <span>P {formatGrams(nutrients.protein)} g</span>
    <span>F {formatGrams(nutrients.fat)} g</span>
    <span>KH {formatGrams(nutrients.carbs)} g</span>
  </div>
</div>

<style>
  /* Passen beide Teile nebeneinander, stehen sie nebeneinander; sonst
     rutschen die Makros in die naechste Zeile statt mitten im Wort zu brechen. */
  .summary {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 6px 12px;
  }

  strong {
    font-size: 22px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .goal {
    margin-left: 0.25em;
    font-weight: 400;
    color: var(--text-2);
  }

  .macros {
    display: flex;
    gap: 12px;
    font-size: 13px;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
</style>
