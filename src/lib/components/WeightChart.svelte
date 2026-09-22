<script lang="ts">
  import type { TrendPoint } from '../calc/weight';
  import type { WeightEntry } from '../db/types';
  import { daysBetween, formatDayShort } from '../utils/date';
  import { formatWeight } from '../utils/number';

  let {
    entries,
    average = [],
  }: {
    /** Chronologisch aufsteigend. */
    entries: WeightEntry[];
    average?: TrendPoint[];
  } = $props();

  const height = 180;
  const padding = { top: 14, right: 46, bottom: 22, left: 6 };

  let width = $state(0);

  const innerWidth = $derived(Math.max(width - padding.left - padding.right, 1));
  const innerHeight = height - padding.top - padding.bottom;

  const bounds = $derived.by(() => {
    const weights = entries.map((entry) => entry.weight);
    return { min: Math.min(...weights), max: Math.max(...weights) };
  });

  const scale = $derived.by(() => {
    // Bei nur einem Wert oder gleichem Gewicht trotzdem eine sinnvolle Skala.
    const span = bounds.max - bounds.min;
    const pad = span === 0 ? 1 : span * 0.15;
    return { low: bounds.min - pad, high: bounds.max + pad };
  });

  const firstDay = $derived(entries[0]?.day ?? '');
  const lastDay = $derived(entries[entries.length - 1]?.day ?? '');
  const spanDays = $derived(firstDay && lastDay ? daysBetween(firstDay, lastDay) : 0);

  function x(day: string): number {
    if (spanDays === 0) return padding.left + innerWidth / 2;
    return padding.left + (daysBetween(firstDay, day) / spanDays) * innerWidth;
  }

  function y(weight: number): number {
    const { low, high } = scale;
    const ratio = high === low ? 0.5 : (weight - low) / (high - low);
    return padding.top + (1 - ratio) * innerHeight;
  }

  const line = $derived(
    entries.map((entry, index) => `${index === 0 ? 'M' : 'L'}${x(entry.day)} ${y(entry.weight)}`).join(' '),
  );

  const areaPath = $derived(
    entries.length > 1
      ? `${line} L${x(lastDay)} ${padding.top + innerHeight} L${x(firstDay)} ${padding.top + innerHeight} Z`
      : '',
  );

  const averagePath = $derived(
    average.length > 1
      ? average
          .map((point, index) => `${index === 0 ? 'M' : 'L'}${x(point.day)} ${y(point.average)}`)
          .join(' ')
      : '',
  );

  // Hilfslinien auf echten Messwerten: hoechstes, mittleres, niedrigstes Gewicht.
  const gridValues = $derived(
    bounds.max === bounds.min
      ? [bounds.max]
      : [bounds.max, (bounds.max + bounds.min) / 2, bounds.min],
  );
  const showDots = $derived(entries.length <= 40);
</script>

<div class="chart" bind:clientWidth={width}>
  {#if width > 0 && entries.length > 0}
    <svg {width} {height} role="img" aria-label="Gewichtsverlauf">
      <defs>
        <linearGradient id="weight-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="var(--accent)" stop-opacity="0.22" />
          <stop offset="1" stop-color="var(--accent)" stop-opacity="0" />
        </linearGradient>
      </defs>

      {#each gridValues as value (value)}
        <line
          class="grid"
          x1={padding.left}
          x2={padding.left + innerWidth}
          y1={y(value)}
          y2={y(value)}
        />
        <text class="axis" x={padding.left + innerWidth + 8} y={y(value)} dominant-baseline="middle">
          {formatWeight(value)}
        </text>
      {/each}

      {#if areaPath}
        <path class="area" d={areaPath} />
      {/if}

      {#if averagePath}
        <path class="average" d={averagePath} />
      {/if}

      {#if entries.length > 1}
        <path class="line" d={line} />
      {/if}

      {#if showDots}
        {#each entries as entry (entry.day)}
          <circle class="dot" cx={x(entry.day)} cy={y(entry.weight)} r="3" />
        {/each}
      {/if}

      <text class="axis" x={padding.left} y={height - 6}>{formatDayShort(firstDay)}</text>
      {#if spanDays > 0}
        <text
          class="axis"
          x={padding.left + innerWidth}
          y={height - 6}
          text-anchor="end">{formatDayShort(lastDay)}</text
        >
      {/if}
    </svg>
  {/if}
</div>

<style>
  .chart {
    width: 100%;
  }

  .grid {
    stroke: var(--separator);
    stroke-width: 1;
  }

  .axis {
    fill: var(--text-2);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }

  .area {
    fill: url(#weight-area);
  }

  .line {
    fill: none;
    stroke: var(--accent);
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .average {
    fill: none;
    stroke: var(--text-2);
    stroke-width: 1.8;
    stroke-dasharray: 5 4;
    stroke-linecap: round;
  }

  .dot {
    fill: var(--accent);
  }
</style>
