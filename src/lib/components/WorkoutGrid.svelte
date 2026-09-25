<script lang="ts">
  import { buildYearGrid, colorForType } from '../calc/workouts';
  import type { WorkoutEntry } from '../db/types';
  import { formatDayFull } from '../utils/date';

  let {
    year,
    workouts,
    types,
    today,
    onselect,
  }: {
    year: number;
    workouts: WorkoutEntry[];
    /** Trainingsarten in stabiler Reihenfolge; bestimmt die Farbe. */
    types: string[];
    today: string;
    onselect: (day: string) => void;
  } = $props();

  const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  const grid = $derived(buildYearGrid(year));
  const byDay = $derived(new Map(workouts.map((entry) => [entry.day, entry])));

  let scroller = $state<HTMLDivElement>();

  // Im laufenden Jahr gleich die aktuellen Wochen zeigen.
  $effect(() => {
    if (scroller && today.startsWith(`${year}-`)) {
      scroller.scrollLeft = scroller.scrollWidth;
    }
  });
</script>

<div class="scroller" bind:this={scroller}>
  <div class="inner" style:--weeks={grid.weeks}>
    <div class="months">
      {#each grid.monthLabels as label (label.month)}
        <span style:grid-column={label.weekIndex + 1}>{MONTHS[label.month]}</span>
      {/each}
    </div>

    <div class="grid">
      {#each grid.cells as cell (cell.day)}
        {@const workout = byDay.get(cell.day)}
        <button
          type="button"
          class="cell"
          class:today={cell.day === today}
          class:future={cell.day > today}
          style:grid-column={cell.weekIndex + 1}
          style:grid-row={cell.weekday + 1}
          style:background={workout ? colorForType(types, workout.type) : undefined}
          aria-label="{formatDayFull(cell.day)}: {workout?.type ?? 'kein Training'}"
          onclick={() => onselect(cell.day)}
        ></button>
      {/each}
    </div>
  </div>
</div>

<style>
  .scroller {
    /* Bis an den Bildschirmrand scrollen, Inhalt bleibt eingerueckt. */
    margin: 0 -16px;
    padding: 0 16px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .scroller::-webkit-scrollbar {
    display: none;
  }

  .inner {
    --cell: 14px;
    --gap: 3px;
    display: inline-block;
  }

  .months,
  .grid {
    display: grid;
    grid-template-columns: repeat(var(--weeks), var(--cell));
    column-gap: var(--gap);
  }

  .months span {
    grid-row: 1;
    /* Der Name ist breiter als eine Spalte und darf nach rechts ueberstehen. */
    white-space: nowrap;
    font-size: 11px;
    color: var(--text-2);
    line-height: 18px;
  }

  .grid {
    grid-template-rows: repeat(7, var(--cell));
    row-gap: var(--gap);
  }

  .cell {
    width: var(--cell);
    height: var(--cell);
    border-radius: 3px;
    background: var(--track);
    padding: 0;
  }

  .cell.future {
    opacity: 0.4;
  }

  .cell.today {
    box-shadow: 0 0 0 1.5px var(--text-2);
  }

  .cell:active {
    opacity: 0.6;
  }
</style>
