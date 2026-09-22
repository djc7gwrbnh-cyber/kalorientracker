<script lang="ts">
  let {
    label,
    value = $bindable(),
    max,
  }: {
    label: string;
    /** Tagesschluessel im Format YYYY-MM-DD, wie ihn input[type=date] nutzt. */
    value: string;
    max?: string;
  } = $props();

  const id = `field-${crypto.randomUUID()}`;
</script>

<div class="row">
  <label for={id}>{label}</label>
  <input {id} type="date" {max} bind:value />
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
    flex: 1;
  }

  input {
    flex: none;
    min-height: var(--tap);
    padding: 0;
    border: none;
    background: none;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  input:focus {
    outline: none;
  }
</style>
