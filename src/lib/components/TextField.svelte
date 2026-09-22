<script lang="ts">
  let {
    label,
    value = $bindable(),
    placeholder,
    autofocus = false,
  }: {
    label: string;
    value: string;
    placeholder?: string;
    autofocus?: boolean;
  } = $props();

  const id = `field-${crypto.randomUUID()}`;
</script>

<div class="row">
  <label for={id}>{label}</label>
  <!-- svelte-ignore a11y_autofocus -->
  <input
    {id}
    type="text"
    autocomplete="off"
    autocapitalize="sentences"
    enterkeyhint="done"
    {autofocus}
    {placeholder}
    bind:value
  />
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: var(--tap);
    padding: 0 16px;
  }

  label {
    flex: none;
  }

  input {
    flex: 1;
    min-width: 0;
    min-height: var(--tap);
    padding: 0;
    border: none;
    background: none;
    text-align: right;
  }

  input::placeholder {
    color: var(--text-3);
  }

  input:focus {
    outline: none;
  }
</style>
