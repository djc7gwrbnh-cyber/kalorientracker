<script lang="ts">
  let {
    value = $bindable(),
    placeholder = 'Suchen',
    onsearch,
  }: { value: string; placeholder?: string; onsearch?: () => void } = $props();

  function handleKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      (event.currentTarget as HTMLInputElement).blur();
      onsearch?.();
    }
  }
</script>

<div class="search">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" stroke-linecap="round" />
  </svg>
  <input
    type="search"
    inputmode="search"
    enterkeyhint="search"
    autocomplete="off"
    autocorrect="off"
    aria-label={placeholder}
    {placeholder}
    bind:value
    onkeydown={handleKey}
  />
  {#if value}
    <button type="button" aria-label="Suche löschen" onclick={() => (value = '')}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm3.3 11.9-1.4 1.4L12 14.4l-1.9 1.9-1.4-1.4L10.6 13l-1.9-1.9 1.4-1.4L12 11.6l1.9-1.9 1.4 1.4L13.4 13z"
        />
      </svg>
    </button>
  {/if}
</div>

<style>
  .search {
    display: flex;
    align-items: center;
    gap: 6px;
    height: var(--tap);
    padding: 0 10px;
    border-radius: 10px;
    background: var(--fill);
    color: var(--text-2);
  }

  svg {
    flex: none;
    width: 17px;
    height: 17px;
  }

  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: none;
    background: none;
    color: var(--text);
  }

  input::placeholder {
    color: var(--text-2);
  }

  input:focus {
    outline: none;
  }

  /* Das eigene Loeschen-Icon ersetzt das von Safari. */
  input::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
  }

  button {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: var(--text-3);
  }

  button svg {
    width: 18px;
    height: 18px;
  }
</style>
