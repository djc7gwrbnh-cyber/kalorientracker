<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    description,
    icon,
    action,
  }: { title: string; description?: string; icon?: Snippet; action?: Snippet } = $props();
</script>

<div class="empty">
  {#if icon}
    <div class="icon" aria-hidden="true">{@render icon()}</div>
  {/if}
  <p class="title">{title}</p>
  {#if description}<p class="description">{description}</p>{/if}
  {#if action}
    <div class="action">{@render action()}</div>
  {/if}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 6px;
    padding: 40px 24px;
    color: var(--text-2);
  }

  .icon {
    width: 46px;
    height: 46px;
    margin-bottom: 6px;
    color: var(--text-3);
  }

  .icon :global(svg) {
    width: 100%;
    height: 100%;
  }

  .title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--text);
  }

  .description {
    margin: 0;
    font-size: 15px;
    max-width: 30ch;
    line-height: 1.4;
  }

  .action {
    margin-top: 14px;
  }
</style>
