<script lang="ts">
  import AddEntrySheet from './AddEntrySheet.svelte';
  import AppHeader from '../components/AppHeader.svelte';
  import DayEntries from '../components/DayEntries.svelte';
  import DayRings from '../components/DayRings.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import QuickAddBar from '../components/QuickAddBar.svelte';
  import SettingsSheet from './SettingsSheet.svelte';
  import { sumEntries } from '../calc/nutrition';
  import { listEntriesForDay } from '../db/entries';
  import { listFoods } from '../db/foods';
  import { liveValue } from '../db/live.svelte';
  import { listMeals } from '../db/meals';
  import type { Food, FoodEntry, Meal } from '../db/types';
  import { profileStore } from '../stores/profile.svelte';
  import { formatDayLong, todayKey } from '../utils/date';

  let settingsOpen = $state(false);
  let addOpen = $state(false);

  const day = todayKey();
  const entries = liveValue<FoodEntry[]>(() => listEntriesForDay(day), []);
  const foods = liveValue<Food[]>(() => listFoods(), []);
  const meals = liveValue<Meal[]>(() => listMeals(), []);
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

  <QuickAddBar {day} foods={foods.current} meals={meals.current} />

  <div class="entries">
    {#if entries.current.length === 0}
      <EmptyState title="Noch nichts eingetragen" description="Tippe auf „+“, um zu starten." />
    {:else}
      <DayEntries entries={entries.current} />
    {/if}
  </div>
</div>

<button type="button" class="fab" aria-label="Essen hinzufügen" onclick={() => (addOpen = true)}>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.4"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
</button>

<SettingsSheet bind:open={settingsOpen} />
<AddEntrySheet bind:open={addOpen} {day} />

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
    /* Platz, damit der letzte Eintrag ueber den "+"-Button gescrollt werden kann. */
    padding-bottom: 76px;
  }

  .fab {
    position: absolute;
    right: max(16px, var(--safe-right));
    bottom: calc(var(--tabbar-height) + var(--safe-bottom) + 16px);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--accent);
    color: #ffffff;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
    transition: transform 0.12s ease;
  }

  .fab svg {
    width: 28px;
    height: 28px;
  }

  .fab:active {
    transform: scale(0.94);
  }
</style>
