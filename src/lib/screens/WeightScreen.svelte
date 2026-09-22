<script lang="ts">
  import AppHeader from '../components/AppHeader.svelte';
  import EmptyState from '../components/EmptyState.svelte';
</script>

<div class="screen">
  <AppHeader title="Gewicht" />
  <EmptyState
    title="Noch keine Messungen"
    description="Trage dein Gewicht ein, um den Verlauf als Graph zu sehen."
  />
</div>
