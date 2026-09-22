<script lang="ts" generics="T extends string">
  let {
    options,
    value = $bindable(),
    label,
  }: {
    options: { value: T; label: string }[];
    value: T;
    label: string;
  } = $props();
</script>

<div class="segmented" role="radiogroup" aria-label={label}>
  {#each options as option (option.value)}
    <button
      type="button"
      role="radio"
      aria-checked={value === option.value}
      class:selected={value === option.value}
      onclick={() => (value = option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .segmented {
    display: flex;
    gap: 2px;
    padding: 2px;
    border-radius: 9px;
    background: var(--fill);
  }

  button {
    position: relative;
    flex: 1;
    min-height: 36px;
    padding: 0 12px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text);
    white-space: nowrap;
    transition:
      background 0.15s ease,
      box-shadow 0.15s ease;
  }

  /* Optisch bleibt die Leiste flach wie in iOS, die Trefferflaeche ist 44px. */
  button::after {
    content: '';
    position: absolute;
    inset: -4px 0;
  }

  button.selected {
    background: var(--bg-elevated);
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }
</style>
