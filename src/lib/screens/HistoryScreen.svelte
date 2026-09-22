<script lang="ts">
  import AppHeader from '../components/AppHeader.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import DayDetailSheet from './DayDetailSheet.svelte';
  import { summarizeDays } from '../calc/history';
  import { listAllEntries } from '../db/entries';
  import { liveValue } from '../db/live.svelte';
  import type { FoodEntry } from '../db/types';
  import { profileStore } from '../stores/profile.svelte';
  import { describeDayShort } from '../utils/date';
  import { formatKcal } from '../utils/number';

  const entries = liveValue<FoodEntry[]>(() => listAllEntries(), []);
  const summaries = $derived(summarizeDays(entries.current));
  const goal = $derived(profileStore.current?.calorieGoal ?? 0);

  let detailOpen = $state(false);
  let selectedDay = $state('');

  function openDay(day: string) {
    selectedDay = day;
    detailOpen = true;
  }
</script>

<div class="screen">
  <AppHeader title="Verlauf" />

  {#if summaries.length === 0}
    <EmptyState
      title="Noch keine Tage erfasst"
      description="Sobald du etwas einträgst, findest du hier deine vergangenen Tage."
    />
  {:else}
    <div class="card list">
      {#each summaries as summary (summary.day)}
        {@const over = goal > 0 && summary.totals.kcal > goal}
        <button type="button" class="row" onclick={() => openDay(summary.day)}>
          <span class="day">{describeDayShort(summary.day)}</span>
          <span class="values">
            <span class="kcal" class:over>{formatKcal(summary.totals.kcal)}</span>
            {#if goal > 0}<span class="goal">/ {formatKcal(goal)}</span>{/if}
            <span class="unit">kcal</span>
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>

<DayDetailSheet bind:open={detailOpen} day={selectedDay} />

<style>
  .list {
    margin-top: 8px;
    padding: 0;
  }

  .row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: var(--tap);
    padding: 12px 16px;
    text-align: left;
  }

  .row + .row {
    box-shadow: inset 0 0.5px 0 var(--separator);
  }

  .row:active {
    opacity: 0.55;
  }

  .day {
    font-size: 17px;
  }

  .values {
    flex: none;
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-variant-numeric: tabular-nums;
  }

  .kcal {
    font-size: 17px;
    font-weight: 500;
  }

  .kcal.over {
    color: var(--fat);
  }

  .goal,
  .unit {
    font-size: 13px;
    color: var(--text-2);
  }
</style>
