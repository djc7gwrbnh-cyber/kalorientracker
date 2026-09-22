<script lang="ts">
  import AppHeader from '../components/AppHeader.svelte';
  import EmptyState from '../components/EmptyState.svelte';
</script>

<div class="screen">
  <AppHeader title="Bibliothek" />
  <EmptyState
    title="Noch keine Lebensmittel"
    description="Lege Lebensmittel und eigene Mahlzeiten an, um sie später mit einem Tipp einzutragen."
  />
</div>
