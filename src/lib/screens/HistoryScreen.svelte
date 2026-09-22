<script lang="ts">
  import AppHeader from '../components/AppHeader.svelte';
  import EmptyState from '../components/EmptyState.svelte';
</script>

<div class="screen">
  <AppHeader title="Verlauf" />
  <EmptyState
    title="Noch keine Tage erfasst"
    description="Sobald du etwas einträgst, findest du hier deine vergangenen Tage im Überblick."
  />
</div>
