<script lang="ts">
  import AppHeader from '../components/AppHeader.svelte';
  import DayEntries from '../components/DayEntries.svelte';
  import DayRings from '../components/DayRings.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import SettingsSheet from './SettingsSheet.svelte';
  import { sumEntries } from '../calc/nutrition';
  import { listEntriesForDay } from '../db/entries';
  import { liveValue } from '../db/live.svelte';
  import type { FoodEntry } from '../db/types';
  import { profileStore } from '../stores/profile.svelte';
  import { formatDayLong, todayKey } from '../utils/date';

  let settingsOpen = $state(false);

  const day = todayKey();
  const entries = liveValue<FoodEntry[]>(() => listEntriesForDay(day), []);
  const totals = $derived(sumEntries(entries.current));
</script>

<div class="screen">
  <AppHeader title="Heute" subtitle={formatDayLong(day)}>
    {#snippet action()}
      <button
        type="button"
        class="gear"
        aria-label="Einstellungen"
        onclick={() => (settingsOpen = true)}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3.2" />
          <path
            d="M19.4 14.2a1.5 1.5 0 0 0 .3 1.65l.06.06a1.8 1.8 0 1 1-2.55 2.55l-.06-.06a1.5 1.5 0 0 0-1.65-.3 1.5 1.5 0 0 0-.9 1.37v.17a1.8 1.8 0 1 1-3.6 0v-.09a1.5 1.5 0 0 0-.98-1.37 1.5 1.5 0 0 0-1.65.3l-.06.06a1.8 1.8 0 1 1-2.55-2.55l.06-.06a1.5 1.5 0 0 0 .3-1.65 1.5 1.5 0 0 0-1.37-.9h-.17a1.8 1.8 0 1 1 0-3.6h.09a1.5 1.5 0 0 0 1.37-.98 1.5 1.5 0 0 0-.3-1.65l-.06-.06a1.8 1.8 0 1 1 2.55-2.55l.06.06a1.5 1.5 0 0 0 1.65.3h.07a1.5 1.5 0 0 0 .9-1.37v-.17a1.8 1.8 0 1 1 3.6 0v.09a1.5 1.5 0 0 0 .9 1.37 1.5 1.5 0 0 0 1.65-.3l.06-.06a1.8 1.8 0 1 1 2.55 2.55l-.06.06a1.5 1.5 0 0 0-.3 1.65v.07a1.5 1.5 0 0 0 1.37.9h.17a1.8 1.8 0 1 1 0 3.6h-.09a1.5 1.5 0 0 0-1.37.9z"
          />
        </svg>
      </button>
    {/snippet}
  </AppHeader>

  {#if profileStore.current}
    <DayRings {totals} profile={profileStore.current} />
  {/if}

  <div class="entries">
    {#if entries.current.length === 0}
      <EmptyState
        title="Noch nichts eingetragen"
        description="Tippe auf „+“, um dein erstes Lebensmittel für heute zu erfassen."
      />
    {:else}
      <DayEntries entries={entries.current} />
    {/if}
  </div>
</div>

<SettingsSheet bind:open={settingsOpen} />

<style>
  .gear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--tap);
    height: var(--tap);
    margin: -10px -10px 0 0;
    color: var(--text-2);
  }

  .gear svg {
    width: 24px;
    height: 24px;
  }

  .gear:active {
    opacity: 0.5;
  }

  .entries {
    margin-top: 24px;
  }
</style>
