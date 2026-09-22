<script lang="ts">
  import { toastStore } from '../stores/toast.svelte';

  async function runAction() {
    const action = toastStore.current?.action;
    toastStore.dismiss();
    if (action) await action.run();
  }
</script>

{#if toastStore.current}
  {#key toastStore.current.id}
    <div class="toast" role="status" aria-live="polite">
      <span class="message">{toastStore.current.message}</span>
      {#if toastStore.current.action}
        <button type="button" onclick={runAction}>{toastStore.current.action.label}</button>
      {/if}
    </div>
  {/key}
{/if}

<style>
  .toast {
    position: fixed;
    left: max(16px, var(--safe-left));
    right: max(16px, var(--safe-right));
    bottom: calc(var(--tabbar-height) + var(--safe-bottom) + 12px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    max-width: 520px;
    margin: 0 auto;
    padding: 6px 6px 6px 16px;
    border-radius: 14px;
    background: var(--surface-2);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.24);
    animation: rise 0.22s cubic-bezier(0.32, 0.72, 0, 1);
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  .message {
    font-size: 15px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  button {
    flex: none;
    min-height: var(--tap);
    padding: 0 14px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--accent);
  }

  button:active {
    opacity: 0.5;
  }
</style>
