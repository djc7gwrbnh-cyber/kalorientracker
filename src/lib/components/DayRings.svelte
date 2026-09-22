<script lang="ts">
  import type { Nutrients, UserProfile } from '../db/types';
  import { formatGrams, formatKcal } from '../utils/number';
  import ProgressRing from './ProgressRing.svelte';

  let { totals, profile }: { totals: Nutrients; profile: UserProfile } = $props();

  const remaining = $derived(profile.calorieGoal - totals.kcal);

  const macros = $derived([
    {
      label: 'Protein',
      value: totals.protein,
      goal: profile.proteinGoal,
      color: 'var(--protein)',
    },
    { label: 'Fett', value: totals.fat, goal: profile.fatGoal, color: 'var(--fat)' },
    ...(profile.carbGoal != null
      ? [
          {
            label: 'Kohlenhydrate',
            value: totals.carbs,
            goal: profile.carbGoal,
            color: 'var(--carbs)',
          },
        ]
      : []),
  ]);
</script>

<div class="card rings">
  <div class="hero">
    <span class="visually-hidden">Kalorien</span>
    <ProgressRing
      value={totals.kcal}
      goal={profile.calorieGoal}
      color="var(--kcal)"
      size={168}
      thickness={15}
    >
      {#snippet children()}
        <strong class="kcal">{formatKcal(totals.kcal)}</strong>
        <span class="of">von {formatKcal(profile.calorieGoal)} kcal</span>
      {/snippet}
    </ProgressRing>
    <p class="remaining" class:over={remaining < 0}>
      {#if remaining >= 0}
        noch {formatKcal(remaining)} kcal
      {:else}
        {formatKcal(-remaining)} kcal darüber
      {/if}
    </p>
  </div>

  <div class="macros" style:--columns={macros.length}>
    {#each macros as macro (macro.label)}
      <div class="macro">
        <span class="label">{macro.label}</span>
        <ProgressRing
          value={macro.value}
          goal={macro.goal}
          color={macro.color}
          size={78}
          thickness={8}
        >
          {#snippet children()}
            <strong class="grams">{formatGrams(macro.value)}</strong>
          {/snippet}
        </ProgressRing>
        <span class="goal">von {formatGrams(macro.goal)} g</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .rings {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 16px 18px;
  }

  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .kcal {
    font-size: 36px;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
    line-height: 1.05;
  }

  .of {
    font-size: 13px;
    color: var(--text-2);
  }

  .remaining {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
    color: var(--text-2);
  }

  .remaining.over {
    color: var(--fat);
  }

  .macros {
    display: grid;
    grid-template-columns: repeat(var(--columns), 1fr);
    gap: 8px;
    padding-top: 4px;
    border-top: 0.5px solid var(--separator);
  }

  .macro {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding-top: 16px;
  }

  /* DOM-Reihenfolge Label -> Wert -> Ziel bleibt vorlesbar,
     sichtbar steht der Ring aber oben. */
  .macro :global(.ring) {
    order: 1;
  }

  .label {
    order: 2;
    font-size: 13px;
    font-weight: 500;
  }

  .goal {
    order: 3;
    font-size: 12px;
    color: var(--text-2);
  }

  .grams {
    font-size: 16px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
</style>
