<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, footer, children }: { title?: string; footer?: string; children: Snippet } =
    $props();
</script>

<section>
  {#if title}<p class="section-title">{title}</p>{/if}
  <div class="group">
    {@render children()}
  </div>
  {#if footer}<p class="hint">{footer}</p>{/if}
</section>

<style>
  .group {
    background: var(--surface);
    border-radius: var(--radius-card);
    overflow: hidden;
  }

  /* Trennlinien zwischen den Zeilen, eingerueckt wie in iOS-Listen. */
  .group :global(> * + *) {
    box-shadow: inset 0 0.5px 0 var(--separator);
  }
</style>
