<script lang="ts">
  import AppHeader from '../components/AppHeader.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import SegmentedControl from '../components/SegmentedControl.svelte';
  import ToggleField from '../components/ToggleField.svelte';
  import WeightChart from '../components/WeightChart.svelte';
  import WeightEditorSheet from './WeightEditorSheet.svelte';
  import {
    filterByRange,
    movingAverage,
    weightStats,
    WEIGHT_RANGES,
    type WeightRange,
  } from '../calc/weight';
  import { liveValue } from '../db/live.svelte';
  import type { WeightEntry } from '../db/types';
  import { listWeights } from '../db/weights';
  import { describeDayShort, formatDayFull, todayKey } from '../utils/date';
  import { formatWeight } from '../utils/number';

  const entries = liveValue<WeightEntry[]>(() => listWeights(), []);

  let range = $state<WeightRange>('30d');
  let showAverage = $state(false);
  let editorOpen = $state(false);
  let editingEntry = $state.raw<WeightEntry | null>(null);

  const today = todayKey();
  const visible = $derived(filterByRange(entries.current, range, today));
  const average = $derived(showAverage ? movingAverage(visible) : []);
  const stats = $derived(weightStats(visible));
  const latest = $derived(entries.current[entries.current.length - 1] ?? null);

  const rangeOptions = WEIGHT_RANGES.map(({ value, label }) => ({ value, label }));

  function openNew() {
    editingEntry = null;
    editorOpen = true;
  }

  function openEdit(entry: WeightEntry) {
    editingEntry = entry;
    editorOpen = true;
  }
</script>

<div class="screen">
  <AppHeader title="Gewicht">
    {#snippet action()}
      <button type="button" class="add" aria-label="Gewicht eintragen" onclick={openNew}>
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

  {#if entries.current.length === 0}
    <EmptyState
      title="Noch keine Messungen"
      description="Trage dein Gewicht ein, um den Verlauf als Graph zu sehen."
    >
      {#snippet action()}
        <button type="button" class="btn btn-secondary" onclick={openNew}>
          Gewicht eintragen
        </button>
      {/snippet}
    </EmptyState>
  {:else}
    <div class="card current">
      <div class="value">
        <strong>{formatWeight(latest?.weight ?? 0)}</strong>
        <span class="unit">kg</span>
      </div>
      <span class="when">{latest ? describeDayShort(latest.day, today) : ''}</span>
    </div>

    <div class="ranges">
      <SegmentedControl label="Zeitraum" options={rangeOptions} bind:value={range} />
    </div>

    {#if visible.length === 0}
      <p class="hint">In diesem Zeitraum gibt es keine Messungen.</p>
    {:else}
      <div class="card chart-card">
        <WeightChart entries={visible} {average} />
        {#if stats && visible.length > 1}
          <p class="change" class:up={stats.change > 0.05} class:down={stats.change < -0.05}>
            {stats.change > 0 ? '+' : ''}{formatWeight(stats.change)} kg im Zeitraum
          </p>
        {/if}
      </div>

      <div class="toggle">
        <div class="card">
          <ToggleField label="7-Tage-Durchschnitt" bind:checked={showAverage} />
        </div>
      </div>
    {/if}

    <section>
      <p class="section-title">Einträge</p>
      <div class="card list">
        {#each [...entries.current].reverse() as entry (entry.day)}
          <button type="button" class="row" onclick={() => openEdit(entry)}>
            <span class="day">{formatDayFull(entry.day)}</span>
            <span class="weight">{formatWeight(entry.weight)} kg</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}
</div>

<WeightEditorSheet bind:open={editorOpen} entry={editingEntry} />

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

  .current {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .value {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .value strong {
    font-size: 34px;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .unit {
    font-size: 17px;
    color: var(--text-2);
  }

  .when {
    font-size: 15px;
    color: var(--text-2);
  }

  .ranges {
    margin-top: 16px;
  }

  .chart-card {
    margin-top: 12px;
    padding: 12px 12px 8px;
  }

  .change {
    margin: 4px 4px 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    text-align: right;
  }

  .change.up {
    color: var(--fat);
  }

  .change.down {
    color: var(--accent);
  }

  .toggle {
    margin-top: 12px;
  }

  .toggle .card {
    padding: 0;
  }

  section {
    margin-top: 24px;
  }

  .list {
    padding: 0;
  }

  .row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: var(--tap);
    padding: 11px 16px;
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
    font-variant-numeric: tabular-nums;
  }

  .weight {
    flex: none;
    font-size: 17px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
</style>
