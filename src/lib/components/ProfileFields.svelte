<script lang="ts">
  import FormGroup from './FormGroup.svelte';
  import NumberField from './NumberField.svelte';

  import type { Snippet } from 'svelte';

  let {
    height = $bindable(),
    calorieGoal = $bindable(),
    proteinGoal = $bindable(),
    fatGoal = $bindable(),
    carbGoal = $bindable(),
    about,
  }: {
    height: number | null;
    calorieGoal: number | null;
    proteinGoal: number | null;
    fatGoal: number | null;
    carbGoal: number | null;
    /** Zusaetzliche Zeilen in der Gruppe "Über dich", z. B. das Gewicht. */
    about?: Snippet;
  } = $props();
</script>

<div class="stack">
  <FormGroup title="Über dich">
    {@render about?.()}
    <NumberField label="Körpergröße" bind:value={height} unit="cm" placeholder="180" />
  </FormGroup>

  <FormGroup
    title="Deine Ziele"
    footer="Die App ändert deine Ziele nie automatisch. Das Kohlenhydrat-Ziel ist optional – ohne Angabe wird kein Ring dafür angezeigt."
  >
    <NumberField label="Kalorien" bind:value={calorieGoal} unit="kcal" placeholder="2500" />
    <NumberField label="Protein" bind:value={proteinGoal} unit="g" placeholder="180" />
    <NumberField label="Fett" bind:value={fatGoal} unit="g" placeholder="80" />
    <NumberField label="Kohlenhydrate" bind:value={carbGoal} unit="g" />
  </FormGroup>
</div>

<style>
  .stack {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
</style>
