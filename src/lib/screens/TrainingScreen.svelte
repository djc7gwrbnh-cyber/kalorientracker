<script lang="ts">
  import AppHeader from '../components/AppHeader.svelte';
  import WorkoutGrid from '../components/WorkoutGrid.svelte';
  import WorkoutEditorSheet from './WorkoutEditorSheet.svelte';
  import { colorForType, summarizeTypes, workoutStats, yearsWithData } from '../calc/workouts';
  import { liveValue } from '../db/live.svelte';
  import type { WorkoutEntry } from '../db/types';
  import { listWorkouts } from '../db/workouts';
  import { describeDayShort, todayKey } from '../utils/date';
  import { formatDecimal } from '../utils/number';

  const workouts = liveValue<WorkoutEntry[]>(() => listWorkouts(), []);

  const today = todayKey();
  const currentYear = Number(today.slice(0, 4));

  const days = $derived(workouts.current.map((entry) => entry.day));
  const typeSummary = $derived(summarizeTypes(workouts.current));
  const typeNames = $derived(typeSummary.map((summary) => summary.type));
  const years = $derived(yearsWithData(days, today));
  const stats = $derived(workoutStats(days, currentYear, today));
  const recent = $derived([...workouts.current].reverse().slice(0, 12));

  let editorOpen = $state(false);
  let editingDay = $state(today);
  let editingEntry = $state.raw<WorkoutEntry | null>(null);

  function openDay(day: string) {
    editingDay = day;
    editingEntry = workouts.current.find((entry) => entry.day === day) ?? null;
    editorOpen = true;
  }
</script>

<div class="screen">
  <AppHeader title="Training">
    {#snippet action()}
      <button
        type="button"
        class="add"
        aria-label="Training eintragen"
        onclick={() => openDay(today)}
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

  <div class="card stats">
    <div class="stat">
      <strong>{stats.total}</strong>
      <span>{stats.total === 1 ? 'Einheit' : 'Einheiten'} {currentYear}</span>
    </div>
    <div class="stat">
      <strong>{stats.thisWeek}</strong>
      <span>diese Woche</span>
    </div>
    <div class="stat">
      <strong>{formatDecimal(stats.perWeek)}</strong>
      <span>Ø pro Woche</span>
    </div>
  </div>

  {#each years as year (year)}
    <section class="year">
      <p class="year-label">{year}</p>
      <WorkoutGrid
        {year}
        workouts={workouts.current}
        types={typeNames}
        {today}
        onselect={openDay}
      />
    </section>
  {/each}

  {#if typeSummary.length > 0}
    <section>
      <p class="section-title">Verteilung</p>
      <div class="card legend">
        {#each typeSummary as summary (summary.type)}
          <div class="entry">
            <span class="dot" style:background={colorForType(typeNames, summary.type)}></span>
            <span class="name">{summary.type}</span>
            <span class="count">{summary.count}×</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <section>
    <p class="section-title">Zuletzt</p>
    {#if recent.length === 0}
      <div class="card hint-card">
        <p>
          Noch nichts eingetragen. Tippe auf „+“ oder auf einen Tag im Raster, um deine erste
          Einheit zu erfassen.
        </p>
      </div>
    {:else}
      <div class="card list">
        {#each recent as entry (entry.day)}
          <button type="button" class="row" onclick={() => openDay(entry.day)}>
            <span class="dot" style:background={colorForType(typeNames, entry.type)}></span>
            <span class="type">
              {entry.type}
              {#if entry.note}<span class="note">{entry.note}</span>{/if}
            </span>
            <span class="day">{describeDayShort(entry.day, today)}</span>
          </button>
        {/each}
      </div>
    {/if}
  </section>
</div>

<WorkoutEditorSheet
  bind:open={editorOpen}
  day={editingDay}
  entry={editingEntry}
  knownTypes={typeNames}
/>

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

  .stats {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat strong {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
  }

  .stat span {
    font-size: 12px;
    color: var(--text-2);
  }

  .year {
    margin-top: 24px;
  }

  .year-label {
    margin: 0 0 6px;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  section {
    margin-top: 24px;
  }

  .legend {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .entry {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
  }

  .dot {
    flex: none;
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .count {
    flex: none;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
  }

  .list {
    padding: 0;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
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

  .type {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: 17px;
  }

  .note {
    font-size: 13px;
    color: var(--text-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .day {
    flex: none;
    font-size: 15px;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
  }

  .hint-card p {
    margin: 0;
    font-size: 15px;
    line-height: 1.45;
    color: var(--text-2);
  }
</style>
