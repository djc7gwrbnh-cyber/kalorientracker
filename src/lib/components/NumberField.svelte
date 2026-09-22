<script lang="ts">
  import { parseDecimal, toInputValue } from '../utils/number';

  let {
    label,
    value = $bindable(),
    unit,
    placeholder,
    decimal = false,
  }: {
    label: string;
    value: number | null;
    unit?: string;
    placeholder?: string;
    /** true erlaubt Nachkommastellen und oeffnet die Dezimaltastatur. */
    decimal?: boolean;
  } = $props();

  const id = `field-${crypto.randomUUID()}`;
  let text = $state(value === null ? '' : toInputValue(value));

  function handleInput(event: Event) {
    text = (event.currentTarget as HTMLInputElement).value;
    value = parseDecimal(text);
  }
</script>

<div class="row">
  <label for={id}>{label}</label>
  <div class="input">
    <!-- type="text" statt "number": Safari akzeptiert damit auch das Komma. -->
    <input
      {id}
      type="text"
      inputmode={decimal ? 'decimal' : 'numeric'}
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      enterkeyhint="done"
      {placeholder}
      value={text}
      oninput={handleInput}
    />
    {#if unit}<span class="unit">{unit}</span>{/if}
  </div>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: var(--tap);
    padding: 6px 16px;
  }

  label {
    flex: 1;
    min-width: 0;
  }

  .input {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  input {
    width: 6ch;
    padding: 6px 0;
    border: none;
    background: none;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  input::placeholder {
    color: var(--text-3);
  }

  input:focus {
    outline: none;
  }

  .unit {
    color: var(--text-2);
    font-size: 15px;
  }
</style>
