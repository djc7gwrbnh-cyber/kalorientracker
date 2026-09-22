<script lang="ts">
  import BarcodeScanner from '../components/BarcodeScanner.svelte';
  import SearchField from '../components/SearchField.svelte';
  import Sheet from '../components/Sheet.svelte';
  import type { FoodDraft } from '../db/foods';
  import { fetchProductByBarcode, searchProducts } from '../off/client';
  import { displayName, offProductToDraft, type OffProduct } from '../off/product';
  import { formatGrams, formatKcal } from '../utils/number';

  let {
    open = $bindable(),
    initialQuery = '',
    onpick,
  }: {
    open: boolean;
    initialQuery?: string;
    /** Uebergibt das vorbefuellte Formular; gespeichert wird erst danach. */
    onpick: (draft: FoodDraft) => void;
  } = $props();

  let mode = $state<'search' | 'scan'>('search');
  let query = $state('');
  let results = $state.raw<OffProduct[]>([]);
  let phase = $state<'idle' | 'loading' | 'done'>('idle');
  let error = $state('');

  $effect(() => {
    if (open) {
      mode = 'search';
      query = initialQuery;
      results = [];
      phase = 'idle';
      error = '';
    }
  });

  async function runSearch() {
    if (query.trim().length < 2) return;
    phase = 'loading';
    error = '';

    const result = await searchProducts(query);
    if (result.ok) {
      results = result.value;
      phase = 'done';
    } else {
      results = [];
      phase = 'idle';
      error = result.error;
    }
  }

  async function useBarcode(code: string) {
    mode = 'search';
    phase = 'loading';
    error = '';

    const result = await fetchProductByBarcode(code);
    phase = 'idle';
    if (result.ok) choose(result.value);
    else error = result.error;
  }

  function choose(product: OffProduct) {
    open = false;
    onpick(offProductToDraft(product));
  }
</script>

<Sheet
  bind:open
  title={mode === 'scan' ? 'Barcode scannen' : 'Online suchen'}
  cancelLabel={mode === 'scan' ? 'Zurück' : 'Abbrechen'}
  oncancel={mode === 'scan' ? () => (mode = 'search') : undefined}
>
  {#if mode === 'scan'}
    <BarcodeScanner ondetect={useBarcode} oncancel={() => (mode = 'search')} />
  {:else}
    <SearchField bind:value={query} placeholder="Produkt suchen" onsearch={runSearch} />

    <div class="actions">
      <button
        type="button"
        class="btn btn-secondary"
        disabled={query.trim().length < 2 || phase === 'loading'}
        onclick={runSearch}
      >
        Suchen
      </button>
      <button type="button" class="btn btn-secondary" onclick={() => (mode = 'scan')}>
        Barcode scannen
      </button>
    </div>

    {#if error}
      <p class="note error" role="alert">{error}</p>
    {:else if phase === 'loading'}
      <p class="note">Wird gesucht …</p>
    {:else if phase === 'done' && results.length === 0}
      <p class="note">Keine Treffer. Versuch es mit einem anderen Suchbegriff.</p>
    {/if}

    {#if results.length > 0}
      <div class="card list">
        {#each results as product (product.barcode)}
          <button type="button" class="hit" onclick={() => choose(product)}>
            <span class="name">{displayName(product)}</span>
            <span class="values">
              {formatKcal(product.per100.kcal)} kcal · {formatGrams(product.per100.protein)} g
              Protein pro 100 {product.unit}
            </span>
          </button>
        {/each}
      </div>
    {/if}

    <p class="note source">
      Daten von Open Food Facts. Du kannst alle Werte vor dem Speichern prüfen und ändern.
    </p>
  {/if}
</Sheet>

<style>
  .actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .actions .btn {
    flex: 1 1 auto;
    padding: 0 14px;
    font-size: 15px;
    white-space: nowrap;
  }

  .note {
    margin: 16px 4px 0;
    font-size: 15px;
    line-height: 1.4;
    color: var(--text-2);
  }

  .note.error {
    color: var(--danger);
  }

  .note.source {
    font-size: 13px;
  }

  .list {
    margin-top: 16px;
    padding: 0;
  }

  .hit {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    width: 100%;
    min-height: var(--tap);
    padding: 10px 16px;
    text-align: left;
  }

  .hit + .hit {
    box-shadow: inset 0 0.5px 0 var(--separator);
  }

  .hit:active {
    background: var(--fill);
  }

  .name {
    font-size: 17px;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .values {
    font-size: 13px;
    color: var(--text-2);
  }
</style>
