<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, subtitle, action }: { title: string; subtitle?: string; action?: Snippet } =
    $props();
</script>

<header class="header">
  <div class="text">
    <h1>{title}</h1>
    {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
  </div>
  {#if action}
    <div class="action">{@render action()}</div>
  {/if}
</header>

<style>
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 0 12px;
  }

  h1 {
    font-size: 34px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .subtitle {
    margin: 4px 0 0;
    font-size: 15px;
    color: var(--text-2);
  }

  .action {
    flex: none;
    display: flex;
    align-items: center;
    padding-top: 4px;
  }
</style>
