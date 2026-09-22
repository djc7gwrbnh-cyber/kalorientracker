<script lang="ts">
  import NumberField from '../components/NumberField.svelte';
  import ProfileFields from '../components/ProfileFields.svelte';
  import { toProfileInput, type ProfileDraft } from '../db/profile';
  import { setWeight } from '../db/weights';
  import { profileStore } from '../stores/profile.svelte';
  import { todayKey } from '../utils/date';

  let draft = $state<ProfileDraft>({
    height: null,
    calorieGoal: null,
    proteinGoal: null,
    fatGoal: null,
    carbGoal: null,
  });
  let weight = $state<number | null>(null);
  let saving = $state(false);
  let error = $state<string | null>(null);

  const input = $derived(toProfileInput(draft));
  const canSave = $derived(input !== null && weight !== null && weight > 0);

  async function submit() {
    const values = input;
    if (!values || weight === null || saving) return;

    saving = true;
    error = null;
    try {
      await setWeight(todayKey(), weight);
      // Zuletzt speichern: sobald das Profil steht, wechselt die App zur Tab-Ansicht.
      await profileStore.save(values);
    } catch {
      error = 'Speichern hat nicht geklappt. Bitte versuch es noch einmal.';
      saving = false;
    }
  }
</script>

<div class="onboarding">
  <div class="content">
    <header>
      <h1>Willkommen</h1>
      <p>
        Trag kurz deine Ziele ein – danach ist eine Mahlzeit in wenigen Sekunden erfasst. Alle
        Daten bleiben auf diesem iPhone.
      </p>
    </header>

    <ProfileFields
      bind:height={draft.height}
      bind:calorieGoal={draft.calorieGoal}
      bind:proteinGoal={draft.proteinGoal}
      bind:fatGoal={draft.fatGoal}
      bind:carbGoal={draft.carbGoal}
    >
      {#snippet about()}
        <NumberField label="Gewicht" bind:value={weight} unit="kg" placeholder="80,0" decimal />
      {/snippet}
    </ProfileFields>

    {#if error}<p class="error" role="alert">{error}</p>{/if}
  </div>

  <footer>
    <button type="button" class="btn btn-primary" disabled={!canSave || saving} onclick={submit}>
      {saving ? 'Wird gespeichert …' : 'Los geht’s'}
    </button>
  </footer>
</div>

<style>
  .onboarding {
    display: flex;
    flex-direction: column;
    height: 100dvh;
  }

  .content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: calc(var(--safe-top) + 24px) 16px 24px;
    padding-left: max(16px, var(--safe-left));
    padding-right: max(16px, var(--safe-right));
  }

  header {
    padding: 0 4px 24px;
  }

  h1 {
    font-size: 34px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  header p {
    margin: 10px 0 0;
    font-size: 15px;
    line-height: 1.45;
    color: var(--text-2);
  }

  .error {
    margin: 16px 4px 0;
    font-size: 15px;
    color: var(--danger);
  }

  footer {
    flex: none;
    padding: 12px 16px;
    padding-bottom: calc(12px + var(--safe-bottom));
    border-top: 0.5px solid var(--separator);
    background: var(--bg);
  }
</style>
