<script lang="ts">
  import ProfileFields from '../components/ProfileFields.svelte';
  import Sheet from '../components/Sheet.svelte';
  import { toProfileDraft, toProfileInput, type ProfileDraft } from '../db/profile';
  import { profileStore } from '../stores/profile.svelte';

  let { open = $bindable() }: { open: boolean } = $props();

  let draft = $state<ProfileDraft>(toProfileDraft(profileStore.current));

  // Beim Oeffnen immer die gespeicherten Werte zeigen.
  $effect(() => {
    if (open) draft = toProfileDraft(profileStore.current);
  });

  const input = $derived(toProfileInput(draft));

  async function save() {
    if (!input) return;
    await profileStore.save(input);
    open = false;
  }
</script>

<Sheet bind:open title="Einstellungen" confirmLabel="Fertig" confirmDisabled={!input} onconfirm={save}>
  <ProfileFields
    bind:height={draft.height}
    bind:calorieGoal={draft.calorieGoal}
    bind:proteinGoal={draft.proteinGoal}
    bind:fatGoal={draft.fatGoal}
    bind:carbGoal={draft.carbGoal}
  />

  <section>
    <p class="section-title">Deine Daten</p>
    <div class="card">
      <p>
        Alle Einträge liegen ausschließlich auf diesem iPhone – ohne Konto, ohne Server. Wenn du
        die App vom Home-Bildschirm entfernst, werden sie mit gelöscht.
      </p>
    </div>
  </section>
</Sheet>

<style>
  section {
    margin-top: 22px;
  }

  .card p {
    margin: 0;
    font-size: 15px;
    line-height: 1.45;
    color: var(--text-2);
  }
</style>
