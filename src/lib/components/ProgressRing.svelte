<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    value,
    goal,
    color,
    size = 120,
    thickness = 12,
    children,
  }: {
    value: number;
    goal: number;
    color: string;
    size?: number;
    thickness?: number;
    children?: Snippet;
  } = $props();

  // Im viewBox 0..100 gerechnet, damit der Ring in jeder Groesse gleich aussieht.
  const stroke = $derived((thickness / size) * 100);
  const radius = $derived(50 - stroke / 2);
  const circumference = $derived(2 * Math.PI * radius);
  const ratio = $derived(goal > 0 ? Math.min(Math.max(value / goal, 0), 1) : 0);
</script>

<div class="ring" style:width="{size}px" style:height="{size}px">
  <svg viewBox="0 0 100 100" aria-hidden="true">
    <circle class="track" cx="50" cy="50" r={radius} stroke-width={stroke} />
    {#if ratio > 0}
      <circle
        class="value"
        cx="50"
        cy="50"
        r={radius}
        stroke={color}
        stroke-width={stroke}
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={circumference * (1 - ratio)}
      />
    {/if}
  </svg>
  {#if children}
    <div class="center">{@render children()}</div>
  {/if}
</div>

<style>
  .ring {
    position: relative;
    flex: none;
  }

  svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    overflow: visible;
  }

  circle {
    fill: none;
  }

  .track {
    stroke: var(--track);
  }

  .value {
    transition: stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    text-align: center;
  }
</style>
