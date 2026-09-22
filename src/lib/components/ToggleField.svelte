<script lang="ts">
  let { label, checked = $bindable() }: { label: string; checked: boolean } = $props();
</script>

<label class="row">
  <span>{label}</span>
  <input type="checkbox" role="switch" bind:checked />
</label>

<style>
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: var(--tap);
    padding: 6px 16px;
  }

  input {
    flex: none;
    appearance: none;
    -webkit-appearance: none;
    position: relative;
    width: 51px;
    height: 31px;
    border-radius: var(--radius-pill);
    background: var(--fill-strong);
    transition: background 0.2s ease;
  }

  input::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 27px;
    height: 27px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
  }

  input:checked {
    background: var(--accent);
  }

  input:checked::after {
    transform: translateX(20px);
  }
</style>
