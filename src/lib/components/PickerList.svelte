<script lang="ts" generics="T extends { id: string; name: string }">
  let {
    sections,
    secondary,
    onpick,
  }: {
    sections: { title: string; items: T[] }[];
    /** Kurzinfo rechts in der Zeile. */
    secondary: (item: T) => string;
    onpick: (item: T) => void;
  } = $props();
</script>

{#each sections as section (section.title)}
  <section>
    <p class="section-title">{section.title}</p>
    <div class="card list">
      {#each section.items as item (item.id)}
        <button type="button" class="pick" onclick={() => onpick(item)}>
          <span class="name">{item.name}</span>
          <span class="info">{secondary(item)}</span>
        </button>
      {/each}
    </div>
  </section>
{/each}

<style>
  section {
    margin-top: 20px;
  }

  .list {
    padding: 0;
  }

  .pick {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    min-height: var(--tap);
    padding: 10px 16px;
    text-align: left;
  }

  .pick + .pick {
    box-shadow: inset 0 0.5px 0 var(--separator);
  }

  .pick:active {
    background: var(--fill);
  }

  .name {
    font-size: 17px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .info {
    flex: none;
    font-size: 13px;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
  }
</style>
