<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    open = $bindable(),
    title,
    cancelLabel = 'Abbrechen',
    confirmLabel,
    confirmDisabled = false,
    onconfirm,
    children,
  }: {
    open: boolean;
    title: string;
    cancelLabel?: string;
    confirmLabel?: string;
    confirmDisabled?: boolean;
    onconfirm?: () => void;
    children: Snippet;
  } = $props();

  let dialog = $state<HTMLDialogElement>();

  $effect(() => {
    const element = dialog;
    if (!element) return;
    if (open && !element.open) element.showModal();
    else if (!open && element.open) element.close();
  });

  function closeOnBackdrop(event: MouseEvent) {
    if (event.target === dialog) open = false;
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} onclose={() => (open = false)} onclick={closeOnBackdrop}>
  <div class="sheet">
    <header>
      <button type="button" class="text-btn" onclick={() => (open = false)}>{cancelLabel}</button>
      <h2>{title}</h2>
      {#if confirmLabel}
        <button
          type="button"
          class="text-btn strong"
          disabled={confirmDisabled}
          onclick={onconfirm}
        >
          {confirmLabel}
        </button>
      {:else}
        <span></span>
      {/if}
    </header>
    <div class="body">
      {@render children()}
    </div>
  </div>
</dialog>

<style>
  dialog {
    width: 100%;
    max-width: 560px;
    max-height: 94dvh;
    margin: auto auto 0;
    padding: 0;
    border: none;
    background: none;
    overflow: visible;
    transform: translateY(0);
    transition:
      transform 0.3s cubic-bezier(0.32, 0.72, 0, 1),
      overlay 0.3s allow-discrete,
      display 0.3s allow-discrete;
  }

  dialog:not([open]) {
    transform: translateY(100%);
  }

  @starting-style {
    dialog[open] {
      transform: translateY(100%);
    }
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.4);
    transition:
      background-color 0.3s ease,
      overlay 0.3s allow-discrete,
      display 0.3s allow-discrete;
  }

  dialog:not([open])::backdrop {
    background: rgba(0, 0, 0, 0);
  }

  @starting-style {
    dialog[open]::backdrop {
      background: rgba(0, 0, 0, 0);
    }
  }

  .sheet {
    display: flex;
    flex-direction: column;
    max-height: 94dvh;
    background: var(--bg);
    border-radius: 14px 14px 0 0;
    padding-left: var(--safe-left);
    padding-right: var(--safe-right);
  }

  header {
    flex: none;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-bottom: 0.5px solid var(--separator);
  }

  h2 {
    font-size: 17px;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .text-btn {
    min-height: var(--tap);
    padding: 0 8px;
    color: var(--accent);
    justify-self: start;
  }

  .text-btn.strong {
    font-weight: 600;
    justify-self: end;
  }

  .text-btn:disabled {
    color: var(--text-3);
    cursor: default;
  }

  .text-btn:active:not(:disabled) {
    opacity: 0.5;
  }

  .body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 16px;
    padding-bottom: calc(16px + var(--safe-bottom));
  }
</style>
