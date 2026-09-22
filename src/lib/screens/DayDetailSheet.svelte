<script lang="ts">
  import DayEntries from '../components/DayEntries.svelte';
  import EmptyState from '../components/EmptyState.svelte';
  import NutrientSummary from '../components/NutrientSummary.svelte';
  import Sheet from '../components/Sheet.svelte';
  import EntryEditorSheet from './EntryEditorSheet.svelte';
  import { sumEntries } from '../calc/nutrition';
  import { deleteEntries, listEntriesForDay } from '../db/entries';
  import { liveValue } from '../db/live.svelte';
  import type { FoodEntry } from '../db/types';
  import { profileStore } from '../stores/profile.svelte';
  import { describeDay } from '../utils/date';

  let { open = $bindable(), day }: { open: boolean; day: string } = $props();

  const entries = liveValue<FoodEntry[]>(
    () => (day ? listEntriesForDay(day) : Promise.resolve([])),
    [],
    () => day,
  );
  const totals = $derived(sumEntries(entries.current));

  let entryEditorOpen = $state(false);
  let editingEntry = $state.raw<FoodEntry | null>(null);

  function editEntry(entry: FoodEntry) {
    editingEntry = entry;
    entryEditorOpen = true;
  }

  async function deleteMeal(mealEntries: FoodEntry[]) {
    const name = mealEntries[0]?.mealName ?? 'Mahlzeit';
    if (!confirm(`„${name}“ von diesem Tag löschen?`)) return;
    await deleteEntries(mealEntries.map((entry) => entry.id));
  }
</script>

<Sheet bind:open title={day ? describeDay(day) : 'Tag'} cancelLabel="Fertig">
  <NutrientSummary nutrients={totals} goalKcal={profileStore.current?.calorieGoal} />

  <div class="entries">
    {#if entries.current.length === 0}
      <EmptyState title="Keine Einträge" description="An diesem Tag wurde nichts erfasst." />
    {:else}
      <DayEntries entries={entries.current} onedit={editEntry} ondeletemeal={deleteMeal} />
    {/if}
  </div>
</Sheet>

<EntryEditorSheet bind:open={entryEditorOpen} entry={editingEntry} />

<style>
  .entries {
    margin-top: 22px;
  }
</style>
